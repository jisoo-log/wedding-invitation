(() => {
  let yOffset = 0; // window.pageYOffset 대신 쓸 변수
  let prevScrollHeight = 0; // 현재 스크롤 위치보다 이전에 위치한 스크롤 섹션들 높이를 합친 값
  let currentScene = 0; // 현재 활성화된 씬
  let enterNewScene = false; // 새로운 씬이 시작되는 순간 true. 씬이 넘어갈때 동작을 한번 씹기 위한 변수.

  const scenes = [
    {
      // 메인 사진 스크롤
      heightRatio: 5,
      scrollHeight: 0,
      type: "sticky",
      objs: {
        container: document.querySelector("#section-0"),
        canvas: document.querySelector("#video-canvas"),
        context: document.querySelector("#video-canvas").getContext("2d"),
        videoImages: [],
      },
      values: {
        videoImageCount: 141,
        imageSequence: [0, 140],
        canvas_opacity: [1, 0, { start: 0.9, end: 1 }],
      },
    },
    {
      // 인사 문구
      scrollHeight: 0,
      type: "normal",
      objs: {
        container: document.querySelector("#section-1"),
      },
    },
    {
      // 사진
      scrollHeight: 0,
      type: "normal",
      objs: {
        container: document.querySelector("#section-2"),
      },
    },
    {
      // 지도
      scrollHeight: 0,
      type: "normal",
      objs: {
        container: document.querySelector("#section-3"),
      },
    }
  ];

  const addZero = (num) => {
    return String(num).padStart(3, "0");
  };

  const setCanvasImages = () => {
    let imgElem;
    for (let i = 1; i <= scenes[0].values.videoImageCount; i++) {
      imgElem = new Image();
      imgElem.src = `./images/out-${addZero(i)}.jpg`;
      scenes[0].objs.videoImages.push(imgElem);
    }
  };
  setCanvasImages();

  const setLayout = () => {
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].type === "sticky") {
        scenes[i].scrollHeight = scenes[i].heightRatio * window.innerHeight;
      } else if (scenes[i].type === "normal") {
        // scenes[i].scrollHeight = scenes[i].objs.container.offsetHeight;
        scenes[i].scrollHeight = 700;
      }
      scenes[i].objs.container.style.height = `${scenes[i].scrollHeight}px`;
    }

    // 맨 처음 스크롤 위치 파악하여 화면 세팅해주는 부분
    yOffset = window.pageYOffset;
    let totalScrollHeight = 0;
    for (let i = 0; i < scenes.length; i++) {
      totalScrollHeight += scenes[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }
    document.body.setAttribute("id", `show-scene-${currentScene}`);

    const heightRatio = window.innerHeight / 1080;
    scenes[0].objs.canvas.style.transform = `translate3d(-50% ,-50% ,0) scale(${heightRatio})`;
  };

  function calcValues(values, currentYOffset) {
    let rv;
    const scrollHeight = scenes[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    if (values.length === 3) {
      // start ~ end 사이에 애니메이션 실행
      const partScrollStart = values[2].start * scrollHeight;
      const partScrollEnd = values[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart;
      if (
        currentYOffset >= partScrollStart &&
        currentYOffset <= partScrollEnd
      ) {
        rv =
          ((currentYOffset - partScrollStart) / partScrollHeight) *
            (values[1] - values[0]) +
          values[0];
      } else if (currentYOffset < partScrollStart) {
        rv = values[0];
      } else if (currentYOffset > partScrollEnd) {
        rv = values[1];
      }
    } else {
      rv = scrollRatio * (values[1] - values[0]) + values[0];
    }
    return rv;
  }

  function playAnimation() {
    const objs = scenes[currentScene].objs;
    const values = scenes[currentScene].values;
    const currentYOffset = yOffset - prevScrollHeight;
    // const scrollHeight = scenes[currentScene].scrollHeight;
    // const scrollRatio = currentYOffset / scrollHeight; // 현재 씬의 scrollHeight;

    switch (currentScene) {
      case 0:
        const sequence0 = Math.round(
          calcValues(values.imageSequence, currentYOffset)
        );
        console.log(sequence0);
        // 이미지, x, y
        objs.context.drawImage(objs.videoImages[sequence0], 0, 0);
        objs.canvas.style.opacity = calcValues(
          values.canvas_opacity,
          currentYOffset
        );
        break;
    }
  }

  function scrollLoop() {
    enterNewScene = false;
    prevScrollHeight = 0;
    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += scenes[i].scrollHeight;
    }

    if (yOffset > prevScrollHeight + scenes[currentScene].scrollHeight) {
      enterNewScene = true;
      if (currentScene === scenes.length - 1) return;
      currentScene++;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }

    if (yOffset < prevScrollHeight) {
      enterNewScene = true;
      if (currentScene === 0) return;
      currentScene--;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }

    if (enterNewScene) return; // 새로운 씬에 들어갈때는 playAnimation 안타고 리턴

    playAnimation();
  }

  window.addEventListener("scroll", () => {
    yOffset = window.pageYOffset;
    scrollLoop();
  });
  window.addEventListener("load", () => {
    scenes[0].objs.context.drawImage(scenes[0].objs.videoImages[0], 0, 0);
    setLayout();
  });

  window.addEventListener("resize", setLayout);

  setLayout();
})();
