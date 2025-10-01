// Project Settings Configuration
// This file contains global settings that can be used across the application

const ProjectSettings = {
    // Edit mode controls whether interactive editing features are enabled
    EDIT_MODE: true,
    
    // Additional settings can be added here as needed
    // DEBUG_MODE: false,
    // PERFORMANCE_MODE: 'high',
    // AUTO_SAVE: true,
};

// Make settings globally accessible
window.ProjectSettings = ProjectSettings;

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectSettings;
}