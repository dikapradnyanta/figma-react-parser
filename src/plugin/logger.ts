export function pluginLog(msg: string, type: 'info' | 'error' | 'success' = 'info') {
  figma.ui.postMessage({ type: 'log', text: msg, logType: type });
}
