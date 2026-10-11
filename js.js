
    const menuBtn = document.querySelector('.Color-button-anim');
    const navList = document.querySelector('.STYcabecalho ul');
    menuBtn.addEventListener('click', function () {
        navList.classList.toggle('open');
    });
    document.querySelectorAll('.STYcabecalho ul a').forEach(function (link) {
        link.addEventListener('click', function () {
            navList.classList.remove('open');
        });
    });
