{
    "statusCode": 200,
    "data": {
        "predictedCompletionDate": "2026-03-14T13:33:46.000Z",
        "confidence": 0.85,
        "estimatedDaysRemaining": 1,
        "scenarios": {
            "optimistic": "2026-03-14T08:33:46.000Z",
            "realistic": "2026-03-14T13:33:46.000Z",
            "pessimistic": "2026-03-15T17:33:46.000Z"
        },
        "bottlenecks": [
            "Single task remaining",
            "No progress yet on tasks"
        ],
        "recommendations": [
            "Allocate focused work sessions to complete the remaining 8 hours of work",
            "Avoid multitasking to ensure timely completion",
            "Regularly monitor progress to prevent any delays"
        ],
        "summary": "The project 'backend-project' currently has only one task remaining, with an estimated 8 hours of work left. Given that no progress has been made yet on this task, the predicted completion date is approximately one day from the project creation date, assuming a standard working day. The confidence level is high at 0.85 due to the small scope remaining and lack of overdue tasks. Optimistic scenario assumes immediate work start and completion within a working day, while pessimistic allows for potential delays extending work into the next day. Key bottlenecks include having all remaining work tied to a single task and zero progress so far. Recommendations focus on focused effort and progress monitoring to avoid delays.",
        "metaData": {
            "processingTime": 6369
        }
    },
    "message": "Project Timeline prediction generated successfully",
    "success": true
}


{ "statusCode": 200, "data": { "isBalanced": true, "teamAverage": 2, "overLoadedMembers": [], "underLoadedMembers": [], "suggestions": [], "summary": "There is only one team member with 2 active tasks, and there are no unassigned tasks. The workload is balanced as there are no other team members to distribute tasks to.", "metaData": { "processingTime": 3622 } }, "message": "Workload balance analysis generated successfully", "success": true }