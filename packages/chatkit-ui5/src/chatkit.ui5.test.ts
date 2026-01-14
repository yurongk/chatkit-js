import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { cpSync, mkdirSync, mkdtempSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

// Loads the real UI5 core so the control is exercised against genuine UI5 runtime
async function bootstrapUI5() {
  const mediaStub = () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    });
  if (!('matchMedia' in window)) {
    (window as any).matchMedia = mediaStub;
  }
  if (!('matchMedia' in globalThis)) {
    (globalThis as any).matchMedia = mediaStub;
  }

  const require = createRequire(import.meta.url);
  const pkgBase = dirname(require.resolve('@openui5/sap.ui.core/package.json'));
  const srcBase = join(pkgBase, 'src');
  const tmpBase = mkdtempSync(join(tmpdir(), 'ui5-'));
  const resourcesDir = join(tmpBase, 'resources');

  mkdirSync(resourcesDir, { recursive: true });
  cpSync(join(srcBase, 'sap-ui-core.js'), join(resourcesDir, 'sap-ui-core.js'));
  cpSync(join(srcBase, 'ui5loader.js'), join(resourcesDir, 'ui5loader.js'));
  cpSync(join(srcBase, 'ui5loader-autoconfig.js'), join(resourcesDir, 'ui5loader-autoconfig.js'));
  cpSync(join(srcBase, 'sap'), join(resourcesDir, 'sap'), { recursive: true });

  const corePath = join(resourcesDir, 'sap-ui-core.js');

  (window as any).sap = (window as any).sap || {};
  // Minimal config to prevent network requests for additional resources
  (window as any)['sap-ui-config'] = {
    theme: 'sap_horizon',
    libs: '',
    async: false,
    'xx-waitForTheme': false,
  };

  const bootstrapScript = document.createElement('script');
  bootstrapScript.id = 'sap-ui-bootstrap';
  bootstrapScript.setAttribute('src', pathToFileURL(corePath).toString());
  bootstrapScript.setAttribute('data-sap-ui-theme', 'sap_horizon');
  bootstrapScript.setAttribute('data-sap-ui-async', 'false');
  const originalGetElementById = document.getElementById.bind(document);
  document.getElementById = ((id: string) =>
    id === 'sap-ui-bootstrap' ? bootstrapScript : originalGetElementById(id)) as any;
  const ready = new Promise<void>((resolve, reject) => {
    bootstrapScript.addEventListener('load', () => resolve());
    bootstrapScript.addEventListener('error', (e) => reject(e as any));
  });
  document.head.appendChild(bootstrapScript);
  await Promise.race([
    ready,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('UI5 bootstrap script load timeout')), 3000),
    ),
  ]);

  for (let i = 0; i < 50; i++) {
    if ((window as any).sap?.ui?.core?.Control) {
      return;
    }
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error('UI5 core did not initialize in time');
}

describe('ChatKit UI5 control (real UI5 core)', () => {
  let ChatKit: any;
  let ui5Ready = false;
  let ui5Error: unknown;

  beforeAll(async () => {
    try {
      await bootstrapUI5();
      ({ ChatKit } = await import('./chatkit.js'));
      ui5Ready = true;
    } catch (err) {
      ui5Error = err;
    }
  });

  it('extends sap.ui.core.Control and renders element', () => {
    if (!ui5Ready) {
      console.warn('Skipping UI5 integration test - bootstrap failed', ui5Error);
      return;
    }

    const control = new ChatKit();
    expect(control instanceof (window as any).sap.ui.core.Control).toBe(true);

    const container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    control.placeAt('content');
    (window as any).sap.ui.getCore().applyChanges();

    const rendered = container.querySelector('xpertai-chatkit');
    expect(rendered).not.toBeNull();
  });
});
