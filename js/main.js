document.addEventListener('DOMContentLoaded', () => {
    mainView.tabScale();
    mainView.tabAnimation();
    mainView.toggleMenu();
    mainView.search();
    mainView.placeSyncInput();
    mainView.calendar.init();
    mainView.personnelCount();
    mainView.staySlide();
    mainView.mbNav();
    mainView.scroll.init();
});


// common util
const util = {
    setClass(els , target, className='active') {
        els.forEach(el => {
            el.classList.remove(className);
        });

        target.classList.add(className);
    },

    removeClass(els, className='active') {
        els.forEach(el => {
            el.classList.remove(className);
        });
    }
};

// dayjs util
const dayjsCustom = {
    getToday() {
        return dayjs();
    },

    getTomorrow() {
        return dayjs().add(1, 'day');
    },

    getThisWeek() {
        const thisWeekFriday = dayjs().startOf('isoWeek').add(4, 'day'); //isoWeek: 월요일 시작
        const thisWeekSunday = dayjs().startOf('isoWeek').add(6, 'day');
        return { thisWeekFriday, thisWeekSunday };
    },

    getNextWeek() {
        const nextWeekFriday = dayjs().add(1, 'week').startOf('isoWeek').add(4, 'day');
        const nextWeekSunday = dayjs().add(1, 'week').startOf('isoWeek').add(6, 'day');
        return { nextWeekFriday, nextWeekSunday };
    }
};

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

        const rawIdx = sessionStorage.getItem('activeIdx');
        const activeIdx = rawIdx !== null ? Number(rawIdx) : 0; //기억된 값 없으면 0으로 초기화
        const activeLi = lis[activeIdx];

        gsap.set(underBar, { 
            x: activeLi.offsetLeft, 
            width: activeLi.offsetWidth 
        });
        activeLi.classList.add('active');
        
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

        // 리사이즈 시 active 요소 기준으로 underBar 재계산
        window.addEventListener('resize', () => {
            requestAnimationFrame(() => {
                const currentActive = document.querySelector('.tab li.active');

                if (currentActive) {
                    gsap.set(underBar, {
                        x: currentActive.offsetLeft,
                        width: currentActive.offsetWidth
                    });
                };
            });
        });
    },

    // menu 열고 닫기
    toggleMenu() {
        const menu = document.querySelector('.util .menu');
        const menuBtn = menu.querySelector('.menuBtn');
        const dropMenu = menu.querySelector('.dropDownWrap');

        menuBtn.addEventListener('click', () => {
            dropMenu.hidden = !dropMenu.hidden;
            menuBtn.setAttribute('aria-label', dropMenu.hidden ? '메뉴 열기' : '메뉴 닫기');
        });
    },
    

    // 검색창 필터
    search() {
        const filterWrap = document.querySelector('.filterWrap');
        const highlight = filterWrap.querySelector('.highlight');
        const filters = filterWrap.querySelectorAll('.filter');
        const dps = filterWrap.querySelectorAll('.dp')
        const filterDp = filterWrap.querySelector('.filterDp');

        // === 스타일 변경 ===
        const activeFilter = (filter) => {
            filterWrap.classList.add('active'); // 배경색 적용
            util.setClass(filters, filter); // 구분선 제거용
        };

        const removeFilter = () => {
            filterWrap.classList.remove('active');
            util.removeClass(filters);
        };

        // === toggle depth ===
        const activeDp = (i) => {
            for(let idx=1; idx<=3; idx++) {
                filterDp.classList.remove(`dp${idx}`);
            };
            filterDp.classList.add(`dp${i+1}`);

            util.setClass(dps, dps[i]);   
        };

        const deactiveDp = () => {
            for(let idx=1; idx<=3; idx++) {
                filterDp.classList.remove(`dp${idx}`);
            };

            util.removeClass(dps);
        };

        // === 배경 하이라이터 ===
        const showHighlight = (filter) => {
            highlight.hidden = false;

            gsap.fromTo(highlight, {
                    x : filter.offsetLeft,
                    width: filter.offsetWidth,
                    scale: 0,
                },
                {
                    scale: 1,
                    transformOrigin: 'center center',
                    duration: .3
                }
            );
        };

        const moveHighlight = (filter) => {
            gsap.to(highlight, {
                x: filter.offsetLeft,
                duration: .3
            })
        };

        const updateHighlight = (filter) => {
            gsap.set(highlight, {
                x: filter.offsetLeft,
                width: filter.offsetWidth
            })
        };

        // filter depth 닫기
        const closeFilterDp = () => {
            removeFilter();
            deactiveDp();
            highlight.hidden=true;
        }

        // filter 클릭시 동작
        filters.forEach((filter , i) => {
            filter.addEventListener('click', () => {
                const isOpen = filterWrap.classList.contains('active');
                const isSame = filters[i].classList.contains('active');

                if (!isSame) {
                    // 열기 or 다른 탭 클릭시
                    activeFilter(filter);
                    activeDp(i);

                    if (!isOpen) { // 열기
                        showHighlight(filter);
                    } else if (isOpen) { // 다른 탭 클릭시
                        moveHighlight(filter);
                    };
                } 
                else if (isOpen && isSame) { // 닫기
                    if (i === 0) return;

                    closeFilterDp();
                };
            });
        });

        // 리사이즈시 하이라이터 업데이트
        window.addEventListener('resize', () => {
            const activeFilter = filterWrap.querySelector('.filter.active');

            if (!activeFilter) return;
                
            updateHighlight(activeFilter);
        });

        // 배경 클릭시 depth 닫기
        document.addEventListener('click', (e) => {

            if (!filterWrap.contains(e.target)) {
                closeFilterDp();
            }
        });
    },

    placeSyncInput() {
        const travelInput = document.querySelector('.travel input');
        const places = document.querySelectorAll('.placeWrap li');

        places.forEach((place) => {
            place.addEventListener('click', () => {
                const placeTxt = place.querySelector('strong');
                travelInput.value = placeTxt.textContent;
            });
        });
    },

    // 날짜 관련
    calendar : {

        fp: null,

        init() {
            // 공통 dom
            this.quickBtn = document.querySelector('.quickBtn');
            this.btns = this.quickBtn.querySelectorAll('button');
            this.todayBtn = this.quickBtn.querySelector('.todayBtn');
            this.tomorrowBtn = this.quickBtn.querySelector('.tomorrowBtn');
            this.weekBtn = this.quickBtn.querySelector('.weekBtn');

            this.dateDp = document.querySelector('.dateDp');
            this.todayEl = this.dateDp.querySelector('.today');
            this.tomorrowEl = this.dateDp.querySelector('.tomorrow');
            this.weekTxt = this.dateDp.querySelector('.weekTxt');
            this.week = this.dateDp.querySelector('.week');

            // dayjs
            this.today = dayjsCustom.getToday();
            this.tomorrow = dayjsCustom.getTomorrow();
            const {thisWeekFriday, thisWeekSunday} = dayjsCustom.getThisWeek();
            this.thisWeekFriday = thisWeekFriday;
            this.thisWeekSunday = thisWeekSunday;
            const {nextWeekFriday, nextWeekSunday} = dayjsCustom.getNextWeek();
            this.nextWeekFriday = nextWeekFriday;
            this.nextWeekSunday = nextWeekSunday;

            // calendar 객체 안 메소드들
            this.renderDate();
            this.renderCalendar();
            this.quickToCal();
            this.calToQuick();
        },

        // 퀵버튼 날짜 렌더링
        renderDate() {
            this.todayEl.textContent = this.today.format('M월 D일');
            this.tomorrowEl.textContent = this.tomorrow.format('M월 D일');
            if (!this.thisWeekFriday.isBefore(this.today, 'day')) {
                this.weekTxt.textContent = '이번 주말';
                this.week.textContent = `${this.thisWeekFriday.format('M월 D일')}~${this.thisWeekSunday.format('D일')}`; 
            } else {
                this.weekTxt.textContent = '다음 주말';
                this.week.textContent = `${this.nextWeekFriday.format('M월 D일')}~${this.nextWeekSunday.format('D일')}`;
            };
        },

        // 달력 (with. flatpickr)
        renderCalendar() {
            this.fp = flatpickr("#datePicker", {
                appendTo: document.querySelector(".calendar"),
                mode: "range",
                dateFormat: "Y-m-d",
                minDate: "today",
                inline: true,
                locale: "ko",
                monthSelectorType: "static",

                onChange: (selectedDates, dateStr, instance) => { //onChange: 날짜 선택할 때마다
                    //selectedDates-> 데이트 객체 배열
                    //dateStr->input에 들어가는 문자열
                    //instance->flatpickr 객체

                    const [start, end] = selectedDates;
                    if (!start) return;
                    const s = dayjs(start);
                    const e = end ? dayjs(end) : null;

                    // 시작일과 종료일이 같으면 종료일 선택 대기 상태 유지
                    if (selectedDates.length === 2) { //시작일+종료일 선택된 상태면
                        if (s.isSame(e, 'day')) { //시작일과 종료일이 같으면
                            instance.setDate([start], false); //setDate(date, triggerChange) //시작일만 선택한 상태 유지, onChange실행x
                            return;
                        };
                    };

                    this.calToQuick(start, end);
                }
            });
        },

        // 퀵 버튼&달력 연동(버튼 -> 달력)
        quickToCal() {
            this.todayBtn.addEventListener('click', () => {
                util.setClass(this.btns , this.todayBtn); // 버튼 스타일 주기

                // 달력 연동
                this.fp.setDate([this.today.toDate(), null], true); // (날짜 선택, onChange) //.toDate(): dayjs객체 -> date객체 변환
                this.fp.jumpToDate(this.today.toDate()); // 달력도 해당 날짜로 이동
            });

            this.tomorrowBtn.addEventListener('click', () => {
                util.setClass(this.btns , this.tomorrowBtn);

                this.fp.setDate([this.tomorrow.toDate(), null], true);
                this.fp.jumpToDate(this.tomorrow.toDate());
            });

            this.weekBtn.addEventListener('click', () => {
                util.setClass(this.btns , this.weekBtn);

                if (this.weekTxt.textContent === '이번 주말') {
                    this.fp.setDate([this.thisWeekFriday.toDate(), this.thisWeekSunday.toDate()], true);
                    this.fp.jumpToDate(this.thisWeekFriday.toDate());
                } else {
                    this.fp.setDate([this.nextWeekFriday.toDate(), this.nextWeekSunday.toDate()], true);
                    this.fp.jumpToDate(this.nextWeekFriday.toDate());
                };
            });
        },

        // 퀵 버튼&달력 연동(달력 -> 버튼)
        calToQuick(start,end) {
            if (!start) return;
            const s = dayjs(start);
            const e = end ? dayjs(end) : null;

            if (s.isSame(this.today, 'day')&&!e) {
                util.setClass(this.btns , this.todayBtn);
            } 
            else if (s.isSame(this.tomorrow, 'day')&&!e) {
                util.setClass(this.btns , this.tomorrowBtn);
            } 
            else if (s.isSame(this.thisWeekFriday, 'day') && e?.isSame(this.thisWeekSunday, 'day')) {
                if (this.weekTxt.textContent === '이번 주말') {
                    util.setClass(this.btns , this.weekBtn);
                } else {
                    util.removeClass(this.btns);
                };
            } 
            else if (s.isSame(this.nextWeekFriday, 'day') && e?.isSame(this.nextWeekSunday, 'day')) {
                console.log('d')
                if (this.weekTxt.textContent === '다음 주말') {
                    util.setClass(this.btns , this.weekBtn);
                } else {
                    util.removeClass(this.btns);
                };
            } 
            else {
                util.removeClass(this.btns);
            };
        }
    },

    // 인원 카운트
    personnelCount() {
        // ===== el&count변수 캐싱 및 사용 =====
        // el&count 객체로 리턴
        const cache = (selector) => {
            const el = document.querySelector(selector);

            return { 
                prev : el.querySelector('.prev'),
                next : el.querySelector('.next'),
                num : el.querySelector('.num'),
                cnt : 0
            }
        };

        // 객체 생성(함수 호출)
        const adult = cache('.adult');
        const child = cache('.child');
        const baby = cache('.baby');

        // ===== 함수 =====
        // === 버튼 클릭시 count 감소&증가 ===
        const decreaseCount = (ps) => {
            if (ps.prev.classList.contains('disabled')) return;

            ps.next.classList.remove('disabled');

            ps.cnt--;
            ps.num.textContent = ps.cnt;
        };

        const increaseCount = (ps) => {
            if (ps.next.classList.contains('disabled')) return;

            ps.prev.classList.remove('disabled');

            ps.cnt++;
            ps.num.textContent = ps.cnt;
        };

        // === 연령대별 최소&최대 인원 ===
        const min = (ps) => {
            if (ps.cnt === 0) ps.prev.classList.add('disabled');
        };

        const adultChildMax = () => {
            const max = (adult.cnt + child.cnt) === 16;

            if (max) {
                adult.next.classList.add('disabled');
                child.next.classList.add('disabled');
            } else if (!max) {
                adult.next.classList.remove('disabled');
                child.next.classList.remove('disabled');
            }
        };

        const babyMax = () => {
            if (baby.cnt === 5) baby.next.classList.add('disabled');
        };

        // === 성인 동반 필요 여부 ===
        // 어린이 or 유아 한 명이라도 있으면 최소 성인 1명 동반
        const needAdult = () => {
            const isNeedAdult = child.cnt>=1 || baby.cnt>=1;

            if (isNeedAdult && adult.cnt === 0) {
                adult.cnt = 1;
                adult.num.textContent = adult.cnt;
            } else if (isNeedAdult && adult.cnt === 1) {
                adult.prev.classList.add('disabled');
            };
        };

        // 어린이&유아 0명이면 성인 없어도 됨
        const noNeedAdult = () => {
            const isNoNeedAdult = child.cnt===0 && baby.cnt===0;

            if (isNoNeedAdult && adult.cnt === 1) {
                adult.prev.classList.remove('disabled');
            }
        };

        // === input value 연동 ===
        const SyncInput = () => {
            const travelerInput = document.querySelector('.traveler input');

            const texts = [];

            if (adult.cnt > 0 || child.cnt > 0) {
                texts.push(`게스트 ${child.cnt + adult.cnt}명`);
            };

            if (baby.cnt > 0) {
                texts.push(`유아 ${baby.cnt}명`);
            };

            travelerInput.value = texts.join(', ');
        };

        // ===== 버튼 클릭 이벤트 =====
        adult.prev.addEventListener('click', () => {
            decreaseCount(adult);
            min(adult);
            needAdult();
            adultChildMax();
            SyncInput();
        });

        adult.next.addEventListener('click', () => {
            increaseCount(adult);
            adultChildMax();
            SyncInput();
        });

        child.prev.addEventListener('click', () => {
            decreaseCount(child);
            min(child);
            noNeedAdult();
            adultChildMax();
            SyncInput();
        });

        child.next.addEventListener('click', () => {
            increaseCount(child);
            adultChildMax();
            needAdult();
            SyncInput();
        });

        baby.prev.addEventListener('click', () => {
            decreaseCount(baby);
            min(baby);
            noNeedAdult();
            SyncInput();
        });

        baby.next.addEventListener('click', () => {
            increaseCount(baby);
            babyMax();
            needAdult();
            SyncInput();
        });
    },

    staySlide() {
        const stayLists = document.querySelectorAll('.stayList');

        stayLists.forEach((stayList) => {
            const staySwiper = stayList.querySelector('.staySwiper');
            const prevBtn = stayList.querySelector('.swiper-button-prev');
            const nextBtn = stayList.querySelector('.swiper-button-next');

            new Swiper(staySwiper, {
                slidesPerView: 2.1,
                spaceBetween: 12,
                navigation: {
                    nextEl: nextBtn,
                    prevEl: prevBtn,
                },
                breakpoints: {
                    768: {
                        slidesPerView: 4,
                    },

                    1024: {
                        slidesPerView: 6
                    },
                }
            });

            prevBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 12px; width: 12px; stroke: currentcolor; stroke-width: 4; overflow: visible;">
                    <path fill="none" d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path>
                </svg>
            `;
            nextBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 12px; width: 12px; stroke: currentcolor; stroke-width: 4; overflow: visible;">
                    <path fill="none" d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"></path>
                </svg>
            `;
        });
    },
    
    scroll : {

        caches : {
            common : {},
            pc : {},
            mb : {}
        },

        init() {
            this.caches.common = {
                header: document.querySelector('header'),
                tab: document.querySelector('.tab')
            };

            this.caches.pc = {
                search: document.querySelector('.searchWrap'),
                mini: document.querySelector('.miniStandard')
            };

            this.caches.mb = {
                nav: document.querySelector('.mbBottomNav'),
                tabImgs : document.querySelectorAll('.tabImgWrap'),
                lastScroll : window.scrollY
            };

            this.scrollEvt();
            this.onScrollInstant(); // 스크롤된 상태에서 페이지 로드시 스크롤된 상태 즉시 반영
        },

        // ============== 이벤트 등록 ==============
        scrollEvt() {
            window.addEventListener('scroll', () => {
                this.onScroll();
            });

            window.addEventListener('resize', () => {
                this.updateCommonUIInstant();
            });
        },

        // ============== 스크롤 함수 ==============
        onScroll() {
            this.updateCommonUI();
            this.updatePcUI();
            this.updateMbUI();
        },

        // pc + mobile
        updateCommonUI() {
            const header = this.caches.common.header;
            const tab = this.caches.common.tab;

            const scrollDown = window.scrollY > 0;

            header.classList.toggle('scroll', scrollDown);
            tab.classList.toggle('scroll', scrollDown);
        },

        // pc
        updatePcUI() {
            const search = this.caches.pc.search;
            const mini = this.caches.pc.mini;

            const scrollDown = window.scrollY > 0;

            search.classList.toggle('pcScroll', scrollDown);
            mini.classList.toggle('pcScroll', scrollDown);
        },

        // mobile
        updateMbUI() {
            this.updateMbNav();
            this.updateMbTab();
        },

        // mobile - mbBottomNav
        updateMbNav() {
            const nav = this.caches.mb.nav;
            let lastScroll = this.caches.mb.lastScroll;

            const currentScroll = window.scrollY;
            const diff = currentScroll - lastScroll;

            if (diff > 20) {
                nav.classList.add('hide');
            };

            if (diff < -20) {
                nav.classList.remove('hide');
            };

            lastScroll = currentScroll;
        },

        // mobile - tabImg
        updateMbTab() {
            const tabImgs = this.caches.mb.tabImgs;

            const scrollY = window.scrollY;

            // scale
            let scale = 1 - (scrollY / 18) * 0.6;
            scale = Math.max(scale, 0.4); // 최소값 0.4로 제한

            // opacity
            let opacity = 1 - (scrollY / 18);
            opacity = Math.max(opacity, 0);

            // 적용
            tabImgs.forEach((tabImg) => {
                gsap.set(tabImg, {
                    scale: scale,
                    opacity: opacity
                });

                if (scale <= 0.4 || opacity <= 0) {
                    tabImg.style.visibility = 'hidden';
                    tabImg.style.pointerEvents = 'none';
                } else {
                    tabImg.style.visibility = 'visible';
                    tabImg.style.pointerEvents = 'auto';
                }
            });
        },

        // ============== 트랜지션 없이 스크롤 함수 적용 ==============
        onScrollInstant() {
            this.updateCommonUIInstant();
            this.updatePcUIInstant();
            this.updateMbUIInstant();
        },

        // pc + mobile
        updateCommonUIInstant() {
            const header = this.caches.common.header;
            const tab = this.caches.common.tab;

            // ===== transition 제거 =====
            tab.classList.add('noTransition');
            header.classList.add('noTransition');
            
            // ===== 현재 스크롤 상태 즉시 반영 =====
            this.updateCommonUI();

            // ===== 다음 렌더링 직전에 transition 복구 =====
            requestAnimationFrame(() => {
                header.classList.remove('noTransition');
                tab.classList.remove('noTransition');
            });
        },

        // pc
        updatePcUIInstant() {
            const search = this.caches.pc.search;
            const mini = this.caches.pc.mini;

            search.classList.add('noTransition');
            mini.classList.add('noTransition');

            this.updatePcUI();

            requestAnimationFrame(() => {
                search.classList.remove('noTransition');
                mini.classList.remove('noTransition');
            });
        },

        // mb
        updateMbUIInstant() {
            const nav = this.caches.mb.nav;

            nav.classList.add('noTransition');

            this.updateMbUI();

            requestAnimationFrame(() => {
                nav.classList.remove('noTransition');
            });
        },
    },

    // mbBottomNav 메뉴 클릭
    mbNav() {
        const lis = document.querySelectorAll('.navWrap li');

        lis.forEach((li) => {
            li.addEventListener('click', () => {
                util.setClass(lis, li);
            });
        });
    }

};