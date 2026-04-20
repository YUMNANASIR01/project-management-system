// -------------- user role enum-----------------------------

export const UserRoleEnum = {
    ADMIN : "admin",
    PROJECT_ADMIN : "project_admin",
    MEMBER : "member"

}
export const AvailableUserRole = Object.values(UserRoleEnum);

// ------------------------- task status enum -------------------------
export const TaskStatusEnum = {
    TODO : "to_do",
    IN_PROGRESS : "in_progress",
    REVIEW : "review",
    DONE : "done"

}
export const AvailableTaskRole = Object.values(TaskStatusEnum);