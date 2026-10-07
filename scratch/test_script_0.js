if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.replace('cms.html?login=required');
        }