# Task: Connect TaskDetail Screen with Backend for Full Functionality

## Overview
Update the TaskDetail screen to enable viewing, editing, adding subtasks, and marking tasks as completed. Add missing backend route for fetching a single task. Modify the Goals screen to list tasks and navigate to TaskDetail.

## Steps to Complete

### 1. Update TaskDetail.js ✅
- Replaced the current TaskDetail.js with the provided modern, functional component.
- Fetches task details by taskId, handles editing (title, description, energy, due date), adds subtasks, and marks as completed.
- Uses the existing BASE_URL from auth.js for API calls.

### 2. Add Get Single Task Route to Backend ✅
- Added a new GET route: router.get('/:id', authenticateToken, async (req, res) => { ... }) in Backend/src/routes/tasks.js
- Fetches a single task by ID and returns it with subtasks.

### 3. Update Goals.js Screen ✅
- Modified Goals.js to fetch and display a list of tasks for the user.
- Added FlatList to show tasks.
- Implemented onPress on each task to navigate to TaskDetail, passing { taskId: task.id }.
- Kept the existing add task functionality and integrated it.

### 4. Verify Navigation ✅
- GoalsStack.js already has TaskDetail screen configured.
- Navigation from Goals to TaskDetail works with taskId.

### 5. Test Backend Routes
- The new GET /:id route is implemented.
- Subtask routes (already present) are functional.

### 6. Update TODO.md ✅
- Marked steps as completed.
