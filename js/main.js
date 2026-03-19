document.addEventListener('DOMContentLoaded', () => {
    mainView.tabUnderBar();
});

const mainView = {

    // .tab .underBar 애니메이션
    tabUnderBar() {
        const lis = document.querySelectorAll('.tab li');
        const underBar = document.querySelector('.underBar');
        const firstLi = document.querySelector('.tab li:first-child');

        underBar.style.left = `${firstLi.offsetLeft}px`;
        underBar.style.width = `${firstLi.offsetWidth}px`;

        lis.forEach((li) => {
            li.addEventListener('click', () => {
                gsap.to(('.underBar'), {
                    x: `${li.offsetLeft}px`, //offsetLeft: static제외 position이 있는 부모 기준 위치 값(absolute left랑 같은건데 자식에 absolute설정 안되어 있어도 됨)
                    width: `${li.offsetWidth}px`, //offsetWidth: 요소의 w
                    duration: .2
                });
            })
        });

        // js에서 active만 주고 css로 애니메이션 주는 방법 2가지 (언더바 위치 이동과 w 적용시 트랜지션 주기 위해서는 li의 위치와 w 수동 적용해야돼서 유지보수를 위해 위 방법 사용)
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

        // tab에 클릭이벤트 걸고 위임(방법2)
        // document.querySelector('.tab').addEventListener('click', (e) => {
        //     const li = e.target.closest('li'); 
        //     const lis = document.querySelectorAll('.tab li');

        //     if(!li) return; 
        //     lis.forEach((el) => {
        //         el.classList.remove('active');
        //     })
        //     li.classList.add('active');
        // });
    }

};