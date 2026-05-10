function buildStatusMessage() {
  // First try to read from status_telegram.md if it exists
  const statusTelegramPath = path.join(ROOT, 'status_telegram.md');
  if (fs.existsSync(statusTelegramPath)) {
    try {
      const statusContent = fs.readFileSync(statusTelegramPath, 'utf8');
      // Extract the key information for a concise status message
      const phaseMatch = statusContent.match(/\*\*Fase Atual:\*\*\s*(.*)/i);
      const progressMatch = statusContent.match(/\*\*Fases Concluídas:\*\*\s*(.*)/i);
      
      if (phaseMatch && progressMatch) {
        return `Status atual:\n- Fase: ${phaseMatch[1].trim()}\n- Progresso: ${progressMatch[1].trim()}`;
      }
      // If we can't extract specific fields, return a truncated version
      return `Status atual:\n${statusContent.slice(0, 300)}`;
    } catch (err) {
      // Fall back to original method if there's an error
    }
  }
  
  // Fall back to original method
  const statePath = path.join(ROOT, '.planning', 'STATE.md');
  if (!fs.existsSync(statePath)) {
    return 'Estado do projeto ainda não encontrado em .planning/STATE.md';
  }

  const data = fs.readFileSync(statePath, 'utf8');
  const phase = (data.match(/Phase:\s*([^\n]+)/i) || [null, 'n/d'])[1].trim();
  const status = (data.match(/Status:\s*([^\n]+)/i) || [null, 'n/d'])[1].trim();
  const progress = (data.match(/Progress:\s*([^\n]+)/i) || [null, 'n/d'])[1].trim();
  return `Status atual:\n- ${phase}\n- ${status}\n- ${progress}`;
}