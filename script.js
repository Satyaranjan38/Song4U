document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profile-picture');
    const profileInitialsElement = document.getElementById('profile-name');
    let currentTrackAudio = null;
    let offset = 0;
    const limit = 10;

    if (!profileImg || !profileInitialsElement) {
        console.error('Profile picture or initials element not found.');
        return;
    }

    const accessToken = localStorage.getItem('access_token');
    const displayName = localStorage.getItem('display_name');
    const profilePicture = localStorage.getItem('profile_picture');
    const profileInitials = displayName ? displayName[0].toUpperCase() : 'U';

    if (accessToken) {
        profileInitialsElement.textContent = profileInitials;

        if (profilePicture) {
            profileImg.src = profilePicture;
            profileImg.style.display = 'block';
            profileInitialsElement.style.display = 'none';
        } else {
            profileImg.style.display = 'none';
            profileInitialsElement.style.display = 'flex';
        }

        loadNewReleases();

        document.getElementById('search-button').addEventListener('click', () => {
            const query = document.getElementById('search-query').value;
            searchTracks(query, accessToken);
        });

        function searchTracks(query, token) {
            fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.status === 401) {
                    // Redirect to login page if unauthorized
                    window.location.href = 'index.html';
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    const searchResultsList = document.getElementById('search-results-list');
                    searchResultsList.innerHTML = ''; // Clear previous results
                    if (data.tracks && data.tracks.items) {
                        data.tracks.items.forEach(track => {
                            const listItem = document.createElement('li');
                            listItem.innerHTML = `
                                <img src="${track.album.images[0]?.url || 'https://via.placeholder.com/50'}" alt="${track.name}">
                                <div class="info">
                                    <h3>${track.name}</h3>
                                    <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                                </div>
                            `;
                            listItem.onclick = () => playTrack(track);
                            searchResultsList.appendChild(listItem);
                        });
                    } else {
                        console.error('Unexpected response structure:', data);
                    }
                    document.getElementById('search-results').style.display = 'block';
                }
            })
            .catch(error => console.error('Error searching tracks:', error));
        }

        function loadNewReleases() {
            fetch(`https://api.spotify.com/v1/browse/new-releases?limit=${limit}&offset=${offset}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            .then(response => {
                if (response.status === 401) {
                    // Redirect to login page if unauthorized
                    window.location.href = 'index.html';
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    const popularList = document.getElementById('popular-list');
                    if (data.albums && data.albums.items) {
                        data.albums.items.forEach(album => {
                            const listItem = document.createElement('li');
                            listItem.innerHTML = `
                                <img src="${album.images[0]?.url || 'https://via.placeholder.com/50'}" alt="${album.name}">
                                <div class="info">
                                    <h3>${album.name}</h3>
                                    <p>${album.artists.map(artist => artist.name).join(', ')}</p>
                                </div>
                            `;
                            listItem.onclick = () => playTrack(album);
                            popularList.appendChild(listItem);
                        });
                        offset += limit; // Update the offset for the next load
                    } else {
                        console.error('Unexpected response structure:', data);
                    }
                }
            })
            .catch(error => console.error('Error fetching new releases:', error));
        }

        function playTrack(track) {
            if (currentTrackAudio) {
                currentTrackAudio.pause();
                currentTrackAudio.currentTime = 0;
            }

            if (!track.preview_url) {
                console.error('No preview URL available for this track.');
                return;
            }

            currentTrackAudio = new Audio(track.preview_url);
            currentTrackAudio.play();

            const currentTrackImage = document.getElementById('current-track-image');
            const currentTrackTitle = document.getElementById('current-track-title');
            const currentTrackArtists = document.getElementById('current-track-artists');
            const currentTrackSeekBar = document.getElementById('current-track-seek-bar');
            const seekBarContainer = document.getElementById('seek-bar-container');

            currentTrackImage.src = track.album.images[0]?.url || 'https://via.placeholder.com/50';
            currentTrackTitle.textContent = track.name;
            currentTrackArtists.textContent = track.artists.map(artist => artist.name).join(', ');

            currentTrackSeekBar.value = 0;
            currentTrackSeekBar.max = currentTrackAudio.duration;

            currentTrackAudio.addEventListener('timeupdate', () => {
                currentTrackSeekBar.value = currentTrackAudio.currentTime;
            });

            document.getElementById('play-button').onclick = () => currentTrackAudio.play();
            document.getElementById('pause-button').onclick = () => currentTrackAudio.pause();
            document.getElementById('stop-button').onclick = () => {
                currentTrackAudio.pause();
                currentTrackAudio.currentTime = 0;
            };

            // Show the seek bar container
            seekBarContainer.classList.add('visible');

            // Adjust seek bar position based on device type
            if (window.innerWidth <= 768) {
                seekBarContainer.classList.remove('pc');
            } else {
                seekBarContainer.classList.add('pc');
            }
        }

        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                loadNewReleases();
            }
        });

    } else {
        console.error('Access token not found.');
        window.location.href = 'index.html'; // Redirect to login page if access token is not found
    }
});
