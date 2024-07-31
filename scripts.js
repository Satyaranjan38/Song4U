document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('access_token');
    const displayName = localStorage.getItem('display_name');
    const email = localStorage.getItem('email');
    const profilePicture = localStorage.getItem('profile_picture');

    if (accessToken) {
        document.getElementById('display-name').textContent = displayName || 'Unknown User';
        document.getElementById('email').textContent = email || 'No email provided';

        // Set profile picture or default image
        const profileImg = document.getElementById('profile-picture');
        profileImg.src = profilePicture || 'https://via.placeholder.com/120?text=Profile+Picture';

        let currentTrackAudio = null;

        // Function to control the audio
        window.playTrack = function(previewUrl) {
            if (currentTrackAudio) {
                currentTrackAudio.pause();
            }
            if (previewUrl) {
                currentTrackAudio = new Audio(previewUrl);
                currentTrackAudio.play();

                document.getElementById('track-controls').style.display = 'flex';

                currentTrackAudio.addEventListener('timeupdate', () => {
                    const seekBar = document.getElementById('seek-bar');
                    seekBar.max = currentTrackAudio.duration;
                    seekBar.value = currentTrackAudio.currentTime;
                });

                document.getElementById('play-button').addEventListener('click', () => {
                    if (currentTrackAudio) {
                        currentTrackAudio.play();
                    }
                });

                document.getElementById('pause-button').addEventListener('click', () => {
                    if (currentTrackAudio) {
                        currentTrackAudio.pause();
                    }
                });

                document.getElementById('stop-button').addEventListener('click', () => {
                    if (currentTrackAudio) {
                        currentTrackAudio.pause();
                        currentTrackAudio.currentTime = 0;
                    }
                });

                document.getElementById('seek-bar').addEventListener('input', (event) => {
                    if (currentTrackAudio) {
                        currentTrackAudio.currentTime = event.target.value;
                    }
                });
            } else {
                alert('Preview not available for this track.');
            }
        };

        // Search for songs
        document.getElementById('search-button').addEventListener('click', () => {
            const query = document.getElementById('search-query').value;
            fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const resultsDiv = document.getElementById('search-results');
                resultsDiv.innerHTML = '<h3>Search Results:</h3>';
                data.tracks.items.forEach(track => {
                    resultsDiv.innerHTML += `
                        <div class="track">
                            <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/80?text=No+Image'}" alt="${track.name}">
                            <div>
                                <h4>${track.name}</h4>
                                <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                                <button onclick="playTrack('${track.preview_url}')">Play</button>
                            </div>
                        </div>
                    `;
                });
            })
            .catch(error => {
                console.error('Error searching for tracks:', error);
                document.getElementById('search-results').textContent = 'Failed to fetch search results.';
            });
        });

        // Fetch user playlists
        document.getElementById('fetch-playlists').addEventListener('click', () => {
            fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const playlistsDiv = document.getElementById('playlists');
                playlistsDiv.innerHTML = '<h3>Your Playlists:</h3>';
                data.items.forEach(playlist => {
                    playlistsDiv.innerHTML += `
                        <div>
                            <h4>${playlist.name}</h4>
                            <p>${playlist.description || 'No description'}</p>
                        </div>
                    `;
                });
            })
            .catch(error => {
                console.error('Error fetching playlists:', error);
                document.getElementById('playlists').textContent = 'Failed to fetch playlists.';
            });
        });
    } else {
        document.body.innerHTML = '<h2>Please log in again.</h2>';
    }
});
