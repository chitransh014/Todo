# TODO: Implement Google Tasks-like Subtask Functionality

## Steps to Complete

- [x] Update Goals.js: Add a floating add button to open AddTaskModal for new tasks, passing onAddTask from TaskContext.
- [x] Update TaskDetail.js: Add edit (inline text input on tap) and delete (trash icon) for subtasks, using backend endpoints.
- [x] Verify TaskContext.js: Ensure addTask handles subtasks correctly (review if changes needed).
- [x] Update TODO.md: Mark steps as completed and add testing note.
- [ ] Test: Add tasks with subtasks, edit/delete subtasks in TaskDetail, verify backend persistence.

## Notes
- Ensure subtasks can be added, toggled, edited, and deleted like Google Tasks.
- Use existing backend endpoints for subtask CRUD.
- Handle UI states for editing subtasks inline.
- Test both new task creation with subtasks and subtask management in TaskDetail.
