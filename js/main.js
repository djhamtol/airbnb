document.addEventListener('DOMContentLoaded', () => {
    mainView.tabScale();
    mainView.tabAnimation();
    mainView.menuBtn();
});

const mainView = {

    // 페이지 로드시 tab 등장
    tabScale() {
        gsap.to('.tabImgWrap', {
            scale: 1,
            duration: .3
        });
    },

    // tab 애니메이션
    tabAnimation() {
        const lis = document.querySelectorAll('.tab li');
        const underBar = document.querySelector('.tab .underBar');

        const activeIdx = Number(sessionStorage.getItem('activeIdx'));

        // underBar, active 초기 설정
        if(activeIdx !== null) { // sessionStorage 저장된 값이 있으면
            const activeLi = lis[activeIdx];

            gsap.set(underBar, {
                x: activeLi.offsetLeft,
                width: activeLi.offsetWidth
            });

            activeLi.classList.add('active');

        } else { // 기억된 값 없으면 (첫 로드)
            gsap.set(underBar, {
                x: lis[0].offsetLeft,
                width: lis[0].offsetWidth
            });

            lis[0].classList.add('active');
        };
        
        // tab 클릭시 underBar, active, video 변화
        lis.forEach((li,i) => {
            li.addEventListener('click', () => {
                gsap.to(underBar, {
                    x: li.offsetLeft, //offsetLeft: position- relative / absolute / fixed인 부모 기준(absolute left랑 같은건데 자식에 absolute설정 안되어 있어도 됨)
                    width: li.offsetWidth, //offsetWidth: 요소의 w
                    duration: .15
                });

                lis.forEach((el) => {
                    el.classList.remove('active', 'playSelected');

                    const videos = el.querySelectorAll('video');
                    videos.forEach((v) => {
                        v.pause();
                        v.currentTime = 0;
                    });
                });

                li.classList.add('active', 'playSelected');
                sessionStorage.setItem('activeIdx', i);

                const selectedVideo = li.querySelector('video.selected');
                selectedVideo.play();
            });
        });
        // js에서 active만 주고 css에서 애니메이션 처리 2가지 방법 (언더바 위치 이동과 w 적용시 트랜지션 주기 위해서는 li의 위치와 w 수동 적용해야돼서 유지보수를 위해 위 방법 사용)
        // li마다 이벤트 걸기 (방법1)
        // const lis = document.querySelectorAll('.tab li');
        // lis.forEach((li) => { 
        //     li.addEventListener('click', (e) => {
        //         lis.forEach((el) => {
        //             el.classList.remove('active');
        //         });
        //         e.currentTarget.classList.add('active');
        //     });
        // })

        // tab에 클릭이벤트 걸고 위임 (방법2)
        // document.querySelector('.tab').addEventListener('click', (e) => {
        //     const li = e.target.closest('li'); 
        //     const lis = document.querySelectorAll('.tab li');

        //     if(!li) return; 
        //     lis.forEach((el) => {
        //         el.classList.remove('active');
        //     })
        //     li.classList.add('active');
        // });
    },

    menuBtn() {
        const menu = document.querySelector('.util .menu');
        const menuBtn = menu.querySelector('.menuBtn');
        const dropMenu = menu.querySelector('.dropDownWrap');

        menuBtn.addEventListener('click', () => {
            if(dropMenu.hidden === true) {
                dropMenu.hidden = false;
                dropMenu.setAttribute('aria-label', '메뉴 닫기');
            } else {
                dropMenu.hidden = true;
                dropMenu.setAttribute('aria-label', '메뉴 열기');
            };
        });
    }

};