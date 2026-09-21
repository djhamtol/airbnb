# [Airbnb](https://djhamtol.github.io/airbnb/)

>Airbnb 웹사이트를 참고하여 제작한 클론 코딩 프로젝트입니다.<br>
헤더 인터랙션과 Day.js, Flatpickr 라이브러리를 활용한 달력 구현에 집중했습니다.

## 🐹 담당

- 퍼블리싱 100%
- 메인 페이지

## 🛠️ 기술 스택

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Swiper](https://img.shields.io/badge/Swiper-6332F6?style=flat&logo=swiper&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat&logo=greensock&logoColor=black)
![Day.js](https://img.shields.io/badge/Day.js-FF5A5F?style=flat&logo=day.js&logoColor=white)
![Flatpickr](https://img.shields.io/badge/Flatpickr-3B82F6?style=flat)

## ✨ 주요 포인트

- 반응형 웹 페이지 구현
- 헤더 인터랙션 구현
- Day.js를 활용한 날짜 처리
- Flatpickr를 활용한 달력 구현

## 🔍 문제 발생 및 해결

- **달력 - 시작일과 같은 날짜 클릭시(시작일===종료일일 때) 어떠한 동작도 하지 않고 종료일 선택 대기 상태 유지하기**

달력 라이브러리로 처음 선택한 LitePicker로 위 기능을 구현하려고 했으나 제공되는 옵션만으로는 해결할 수 없어 직접 JS 코드를 짜기로 했습니다.
```js
picker.on('preselect', (startObj, endObj) => { // 날짜 선택 직전 실행
    const startDate = startObj.format('YYYY-MM-DD');
    const input = document.querySelector('.datePicker');
    input.value = startDate; // litepicker는 기본적으로 range 선택 완료시에만 input에 날짜 기입 됨. 

    if (startObj&&endObj) { // //시작일+종료일 선택된 상태일 때
        const endDate = endObj.format('YYYY-MM-DD');
        if (startDate === endDate) { // 시작일===종료일일 때
            picker.clearSelection();
            input.value = startDate; // 2026-04-26 - 2026-04-26을 2026-04-26으로 덮어쓰기
            document.querySelectorAll('.day-item').forEach(el => {
            const time = el.dataset.time;
            const date = dayjs(Number(time)).format('YYYY-MM-DD');

            if (date === startDate) {
                el.className = 'day-item is-start-date'; // 종료일 찾아서 클래스 덮어쓰기
            }
            });
        }
    }
}
```
하지만 LitePicker 내부 코드가 제가 작성한 코드를 덮어씌웠고 preselect(날짜 선택 직전 실행) 이벤트를 selected(날짜 선택 직후 실행)로도 바꿔보았지만 같은 문제가 지속되었습니다.

이를 해결하기에는 어렵다고 판단하여 커스텀에 더 유연한 FlatPickr 라이브러리로 변경했습니다.

```js
onChange: function(selectedDates, dateStr, instance) { //onChange: 날짜 선택할 때마다
        //selectedDates-> 데이트 객체 배열
        //dateStr->input에 들어가는 문자열
        //instance->flatpickr 객체
        if (selectedDates.length === 2) { //시작일+종료일 선택된 상태일 때
            const [start, end] = selectedDates;

            if (start.getTime() === end.getTime()) { //시작일===종료일일 때 //date객체끼리는 비교할 수 없음. getTime()으로 날짜&시간 비교. (getTime()은 날짜를 밀리초로 변환하는 메소드)
                instance.setDate([start], false); //setDate(date, triggerChange) //시작일만 선택된 상태 유지, onChange실행x
            }
        }
    }
});
```
종료일 선택시 시작일과 같은 날짜면 instance.setDate([start], false); 코드로 시작일만 선택된 상태를 유지하도록 하여 원하는 기능 구현에 성공했습니다.

**✔ 결론: 커스터마이징 할 수 있는 영역인지 빠르게 판단하는 것도 중요하다고 느꼈으며 필요에 따라 직접 구현도 해보면서 라이브러리 의존도를 낮춰갈 수 있도록 해야겠다고 생각했습니다.**
