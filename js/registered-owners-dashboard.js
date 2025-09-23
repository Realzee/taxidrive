// Registered Owners Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    const registeredOwnersContent = document.getElementById('registered-owners-content');
    const refreshRegisteredOwnersBtn = document.getElementById('refresh-registered-owners');
    const editOwnerModal = document.getElementById('edit-owner-modal');
    const editOwnerForm = document.getElementById('edit-owner-form');

    let selectedOwnerId = null;
    let selectedOwnerData = null;
    let registeredOwners = {};
    let isInitialized = false;

    // Initialize registered owners dashboard
    async function initializeRegisteredOwnersDashboard() {
        if (isInitialized) return;

        if (!window.userId) {
            console.log('Waiting for authentication...');
            // Wait for authentication
            setTimeout(initializeRegisteredOwnersDashboard, 1000);
            return;
        }

        isInitialized = true;
        console.log('Initializing registered owners dashboard for user:', window.userId);

        await loadRegisteredOwners();
        setupRegisteredOwnersEventListeners();
    }

    async function loadRegisteredOwners() {
        try {
            showRegisteredOwnersLoadingState();
            await Promise.all([
                loadApprovedOwners(),
                loadRegisteredOwnersStats()
            ]);
        } catch (error) {
            console.error('Error loading registered owners:', error);
            showRegisteredOwnersErrorState('Failed to load registered owners. Please try refreshing.');
        }
    }

    async function loadApprovedOwners() {
        try {
            if (typeof enhancedFirebaseService !== 'undefined' && enhancedFirebaseService.fetchApprovedOwners) {
                registeredOwners = await enhancedFirebaseService.fetchApprovedOwners();
                // Filter by current association
                registeredOwners = filterOwnersByAssociation(registeredOwners);
                renderRegisteredOwners(registeredOwners);
            } else {
                console.warn('Enhanced Firebase Service not available, using fallback');
                await loadApprovedOwnersFallback();
            }
        } catch (error) {
            console.error('Error loading approved owners:', error);
            showRegisteredOwnersErrorState('Failed to load approved owners.');
        }
    }

    async function loadApprovedOwnersFallback() {
        // Fallback implementation using direct Firebase calls
        const snapshot = await db.ref('users').orderByChild('associationApproved').equalTo(true).once('value');
        const users = snapshot.val() || {};
        registeredOwners = Object.fromEntries(
            Object.entries(users).filter(([id, user]) => user.role === 'owner')
        );
        // Filter by current association
        registeredOwners = filterOwnersByAssociation(registeredOwners);
        renderRegisteredOwners(registeredOwners);
    }

    function filterOwnersByAssociation(owners) {
        if (!window.userId) return owners;

        const filteredOwners = {};
        Object.entries(owners).forEach(([ownerId, owner]) => {
            // Only include owners that belong to the current association
            if (owner.associationId === window.userId) {
                filteredOwners[ownerId] = owner;
            }
        });
        return filteredOwners;
    }

    function renderRegisteredOwners(owners) {
        if (!owners || Object.keys(owners).length === 0) {
            registeredOwnersContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Registered Owners</h3>
                    <p>No owners have been approved yet.</p>
                </div>
            `;
            return;
        }

        registeredOwnersContent.innerHTML = '';

        Object.entries(owners).forEach(([ownerId, owner]) => {
            const ownerItem = document.createElement('div');
            ownerItem.className = 'list-item';
            ownerItem.innerHTML = `
                <div class="owner-info">
                    <h4>${owner.name || 'Unnamed Owner'}</h4>
                    <p><i class="fas fa-envelope"></i> ${owner.email || 'N/A'}</p>
                    <p><i class="fas fa-phone"></i> ${owner.phone || 'N/A'}</p>
                    <p><i class="fas fa-building"></i> ${owner.associationName || 'No Association'}</p>
                    <p><i class="fas fa-calendar"></i> Registered: ${formatDate(owner.createdAt)}</p>
                </div>
                <div class="owner-actions">
                    <button class="btn btn-primary btn-sm edit-owner-btn" data-owner-id="${ownerId}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            `;
            registeredOwnersContent.appendChild(ownerItem);
        });

        // Add event listeners for edit buttons
        const editButtons = registeredOwnersContent.querySelectorAll('.edit-owner-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                selectedOwnerId = button.getAttribute('data-owner-id');
                selectedOwnerData = owners[selectedOwnerId];
                await openEditOwnerModal(selectedOwnerId);
            });
        });
    }

    async function openEditOwnerModal(ownerId) {
        try {
            // Load associations for dropdown
            await loadAssociationsForDropdown();

            // Populate form with owner data
            populateEditOwnerForm(selectedOwnerData);

            // Show modal
            openModal('edit-owner-modal');
        } catch (error) {
            console.error('Error opening edit owner modal:', error);
            alert('Failed to load owner details for editing.');
        }
    }

    async function loadAssociationsForDropdown() {
        try {
            let associations = {};
            if (typeof enhancedFirebaseService !== 'undefined' && enhancedFirebaseService.getAssociations) {
                associations = await enhancedFirebaseService.getAssociations();
            } else {
                // Fallback implementation
                const snapshot = await db.ref('users').orderByChild('role').equalTo('association').once('value');
                const associationData = snapshot.val() || {};
                associations = Object.fromEntries(
                    Object.entries(associationData).map(([id, association]) => [
                        id,
                        {
                            id: id,
                            name: association.name || 'Unnamed Association',
                            email: association.email || 'N/A'
                        }
                    ])
                );
            }

            const associationSelect = document.getElementById('edit-owner-association');
            associationSelect.innerHTML = '<option value="">Select Association</option>';

            Object.entries(associations).forEach(([id, association]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = association.name;
                associationSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading associations:', error);
        }
    }

    function populateEditOwnerForm(owner) {
        document.getElementById('edit-owner-name').value = owner.name || '';
        document.getElementById('edit-owner-email').value = owner.email || '';
        document.getElementById('edit-owner-phone').value = owner.phone || '';
        document.getElementById('edit-owner-notes').value = owner.notes || '';

        // Set association - default to current user's association
        const associationSelect = document.getElementById('edit-owner-association');
        if (owner.associationId) {
            associationSelect.value = owner.associationId;
        } else {
            // If no association is set, default to current user's association
            associationSelect.value = window.userId || '';
        }

        // Set status
        const statusSelect = document.getElementById('edit-owner-status');
        statusSelect.value = owner.status || 'active';
    }

    async function loadRegisteredOwnersStats() {
        try {
            const stats = await calculateRegisteredOwnersStats();
            updateRegisteredOwnersStatsDisplay(stats);
        } catch (error) {
            console.error('Error loading registered owners stats:', error);
        }
    }

    async function calculateRegisteredOwnersStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const owners = registeredOwners;
        let totalRegistered = Object.keys(owners).length;
        let activeOwners = 0;
        let inactiveOwners = 0;
        let updatedToday = 0;

        Object.entries(owners).forEach(([ownerId, owner]) => {
            if (owner.status === 'active') {
                activeOwners++;
            } else if (owner.status === 'inactive') {
                inactiveOwners++;
            }

            if (owner.updatedAt) {
                const updatedDate = new Date(owner.updatedAt);
                if (updatedDate >= today) {
                    updatedToday++;
                }
            }
        });

        return {
            totalRegistered,
            activeOwners,
            inactiveOwners,
            updatedToday
        };
    }

    function updateRegisteredOwnersStatsDisplay(stats) {
        document.getElementById('registered-count').textContent = stats.totalRegistered;
        document.getElementById('active-owners-count').textContent = stats.activeOwners;
        document.getElementById('inactive-owners-count').textContent = stats.inactiveOwners;
        document.getElementById('updated-today-count').textContent = stats.updatedToday;

        // Update association header stats
        updateAssociationHeaderStats({
            totalRegistered: stats.totalRegistered,
            activeOwners: stats.activeOwners,
            pendingCount: 0 // This would need to be calculated separately if needed
        });
    }

    // Make updateAssociationHeaderStats available globally if not already defined
    if (typeof updateAssociationHeaderStats === 'undefined') {
        window.updateAssociationHeaderStats = function(stats) {
            const registeredCountElement = document.getElementById('association-registered-count');
            const activeCountElement = document.getElementById('association-active-count');
            const pendingCountElement = document.getElementById('association-pending-count');

            if (registeredCountElement) {
                registeredCountElement.textContent = stats.totalRegistered || 0;
            }

            if (activeCountElement) {
                activeCountElement.textContent = stats.activeOwners || 0;
            }

            if (pendingCountElement) {
                pendingCountElement.textContent = stats.pendingCount || 0;
            }
        };
    }

    function showRegisteredOwnersLoadingState() {
        registeredOwnersContent.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading registered owners...</p>
            </div>
        `;
    }

    function showRegisteredOwnersErrorState(message) {
        registeredOwnersContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    function setupRegisteredOwnersEventListeners() {
        // Refresh registered owners button
        refreshRegisteredOwnersBtn.addEventListener('click', () => {
            loadRegisteredOwners();
        });

        // Edit owner form submission
        editOwnerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleEditOwnerSubmit();
        });
    }

    async function handleEditOwnerSubmit() {
        if (!selectedOwnerId) return;

        try {
            const formData = new FormData(editOwnerForm);
            const updates = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                associationId: formData.get('associationId'),
                status: formData.get('status'),
                notes: formData.get('notes')
            };

            // Validate required fields
            if (!updates.name || !updates.email || !updates.associationId) {
                alert('Please fill in all required fields.');
                return;
            }

            if (typeof enhancedFirebaseService !== 'undefined' && enhancedFirebaseService.updateOwnerDetails) {
                await enhancedFirebaseService.updateOwnerDetails(selectedOwnerId, updates);
            } else {
                // Fallback implementation
                const enhancedUpdates = {
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                await db.ref(`users/${selectedOwnerId}`).update(enhancedUpdates);
            }

            alert('Owner details updated successfully!');

            closeModal('edit-owner-modal');

            // Refresh registered owners list
            await loadRegisteredOwners();

        } catch (error) {
            console.error('Error updating owner details:', error);
            alert('Failed to update owner details. Please try again.');
        }
    }

    // Initialize registered owners dashboard
    initializeRegisteredOwnersDashboard();
});
