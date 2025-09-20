/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');

    // Initialize Firebase and app logic here
    initApp();
}

function initApp() {
    // Firebase config and initialization moved here if needed

    // Variables
    let walletBalance = 0;
    let isLoggedIn = false;
    let userId = null;

    // Firebase auth and database references
    const auth = firebase.auth();
    const db = firebase.database();
    const storage = firebase.storage();

    // Function to check if a string is a valid data URL
    function isValidDataURL(str) {
        return str && str.startsWith('data:image/') && str.includes('base64,');
    }

    // Add your app functions here, e.g., updateEarningsHistory, updateFleetOverview, updateDriverManagement, etc.
    // Implement the TODO notifications for licence and PrDP expiry

    // Notification for licence and PrDP expiry within 60 days
    function checkDriverExpiryNotifications() {
        if (!userId) return;
        const now = new Date();
        const expiryThreshold = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now

        db.ref(`users/owners/${userId}/drivers`).once('value', snapshot => {
            const drivers = snapshot.val() || {};
            Object.entries(drivers).forEach(([driverId, driver]) => {
                if (driver.licenceExpiry) {
                    const licenceExpiryDate = new Date(driver.licenceExpiry);
                    if (licenceExpiryDate <= expiryThreshold) {
                        alert(`Driver ${driver.name} ${driver.surname}'s licence expires soon on ${driver.licenceExpiry}`);
                    }
                }
                if (driver.prdpExpiry) {
                    const prdpExpiryDate = new Date(driver.prdpExpiry);
                    if (prdpExpiryDate <= expiryThreshold) {
                        alert(`Driver ${driver.name} ${driver.surname}'s PrDP expires soon on ${driver.prdpExpiry}`);
                    }
                }
            });
        });
    }

    // Call checkDriverExpiryNotifications on auth state change
    auth.onAuthStateChanged(user => {
        if (user) {
            isLoggedIn = true;
            userId = user.uid;
            checkDriverExpiryNotifications();
            // Other initialization code...
        } else {
            isLoggedIn = false;
            userId = null;
        }
    });

    // Other app initialization code can go here
}
