# TODO: Add Subtask System to Todo App

## Backend Changes
- [x] Update Task model (Backend/src/models/Task.js) to include subtasks array with subtaskSchema (title, status enum: 'pending', 'completed').
- [x] Add subtask CRUD routes in Backend/src/routes/tasks.js:
  - POST /:taskId/subtasks (add subtask)
  - PUT /:taskId/subtasks/:subtaskId (update subtask status)
  - DELETE /:taskId/subtasks/:subtaskId (delete subtask)
- [x] Ensure routes use authenticateToken middleware and handle MongoDB subdocuments correctly.

## Frontend Changes
- [x] Update Goals.js (todo-frontend/src/screens/Goals.js):
  - Add state for selectedTask, newSubtask, subtasks list.
  - Add subtask modal with input for new subtask, list of subtasks with toggle/delete.
  - Add "Subtasks" button in task card to open modal.
  - Implement addSubtask, toggleSubtask, deleteSubtask functions with API calls.
  - Refresh task data after subtask changes.

## Testing and Validation
- [ ] Test backend routes for subtask CRUD.
- [ ] Test frontend subtask UI and API integration.
- [ ] Ensure no breaking changes to existing functionality.
- [ ] Update any related tests if necessary.
