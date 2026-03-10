# Workflow: /save

## Objetivo
Sincronizar el estado actual de la conversación con los archivos de memoria persistente para evitar la pérdida de contexto.

## Instrucciones para el Agente
1. **Analizar**: Revisa los últimos mensajes de esta sesión y extrae:
   - Tareas completadas.
   - Errores pendientes o bloqueos.
   - Nuevos datos técnicos (IDs, URLs, Variables).
2. **Actualizar JARVIS_MEMORY.md**: Sobrescribe el archivo con el nuevo estado del proyecto y los "Próximos pasos" actualizados.
3. **Actualizar CONFIG_TECHNIQUE.md**: Si aparecieron nuevos tokens o rutas, regístralos aquí.
4. **Confirmar**: Dime: "✅ Memoria actualizada. He guardado [resumen de lo guardado]. Ya puedes cerrar la sesión tranquilo."