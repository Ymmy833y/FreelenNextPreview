
class Screen {
  #WIDTH = 8;
  #HEIGHT = 6;
  constructor() {
    this.state = new Array(this.#HEIGHT).fill().map(() => new Array(this.#WIDTH).fill(false));
  }

  getPostion(isHorizontal, wordLength) {
    const parts = this.getParts(isHorizontal, wordLength);
    let x, y;
    
    let attempt = 3000;
    let allowDuplicates = false;

    while (attempt--) {
      x = Math.floor(Math.random() * (this.#WIDTH - parts.width + 1));
      y = Math.floor(Math.random() * (this.#HEIGHT - parts.height + 1));
      if (this.isValidPosition(x, y, parts.width, parts.height, allowDuplicates)) {
        break;
      }

      if (attempt < 0) {
        attempt = 3000;
        allowDuplicates = true;
      }
    }

    this.setParts(x, y, isHorizontal, wordLength, true);
    return { coordinate: [x, y], place: [x/this.#WIDTH*100, y/this.#HEIGHT*100]};
  }

  getCenterPostion(isHorizontal, wordLength) {
    const parts = this.getParts(isHorizontal, wordLength);
    const x = (this.#WIDTH - parts.width) / 2;
    const y = (this.#HEIGHT - parts.height) / 2;

    this.setParts(Math.floor(x), Math.floor(y), isHorizontal, wordLength, true);
    return { coordinate: [Math.floor(x), Math.floor(y)], place: [x/this.#WIDTH*100, y/this.#HEIGHT*100]};
  }

  isValidPosition(x, y, width, height, allowDuplicates=false) {
    if (x < 0 || y < 0 || x + width > this.#WIDTH || y + height > this.#HEIGHT) {
      return false;
    }
    
    if (allowDuplicates) {
      return true;
    }

    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        if (this.state[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  getParts(isHorizontal, wordLength) {
    if (isHorizontal) {
      const height = this.#HEIGHT < (wordLength / 2.5) ? this.#HEIGHT - 1 : wordLength / 2.5;
      return { width: 1, height: height }; 
    } else {
      const width = this.#WIDTH < (wordLength / 2.5) ? this.#WIDTH - 1 : wordLength / 2.5;
      return { width: width, height: 1 }; 
    }
  }

  setParts(x, y, isHorizontal, wordLength, isUsed=true) {
    const parts = this.getParts(isHorizontal, wordLength);
    for (let i = y; i < y + parts.height; i++) {
      for (let j = x; j < x + parts.width; j++) {
        this.state[i][j] = isUsed;
      }
    }
  }
}


class Word {
  constructor(word, isHorizontal, positon=[], place=[]) {
    this.screenElem = document.querySelector("#screen");

    this.isHorizontal = isHorizontal;
    this.wordLength = word.length;
    this.positon = positon;

    this.ELEM = document.createElement("div");
    this.ELEM.innerText = word;
    this.ELEM.classList.add("word");
    this.ELEM.style.left = place[0] + "%";
    this.ELEM.style.top = place[1] + "%";
    this.ELEM.style.writingMode = this.getWritingMode(isHorizontal);
  }
  
  // 縦書きor横書き
  getWritingMode = (isHorizontal) => {
    return isHorizontal ? "vertical-rl" : "horizontal-tb";
  };

  animation(callback, screen) {
    anime
      .timeline({
        targets: this.ELEM,
        begin: () => {
          this.screenElem.appendChild(this.ELEM);
          this.screenElem.style.backgroundColor = "#FFF";
        }
      })
      .add({
        opacity: [0, 1], 
        scale: [0.5, 1], 
        duration: 500, 
        easing: "easeInOutQuad",
      })
      .add({
        scale: [1, 0.75],
        duration: 2500, 
        easing: "easeOutQuad",
      }, 500)
      .add({
        duration: 1000,
        filter: ["blur(0px)", "blur(10px)"],
        easing: "easeOutQuad",
      }, 2000)
      .add({
        duration: 500,
        opacity: [1, 0],
        easing: "easeOutQuad",
        complete: () => {
          callback.call(screen, this.positon[0], this.positon[1], this.isHorizontal, this.wordLength, false);
        }
      }, 2500);
  };

  animationForLastWord(callback, screen) {
    anime
      .timeline({
        targets: this.screenElem,
      }).add({
        backgroundColor: '#000',
        duration: 500,
        easing: "easeInOutQuad",
      }, 1500)
      .add({
        targets: this.ELEM,
        color: ["#000", "#FFF"],
        duration: 1500,
        opacity: [0.5, 1],
        scale: [1.5, 1.25],
        easing: "easeInOutQuad",
        begin: () => {
          this.screenElem.appendChild(this.ELEM);
          this.ELEM.style.letterSpacing = "0.25em"
        },
        callback: () => {
          callback.call(screen, this.positon[0], this.positon[1], this.isHorizontal, this.wordLength, false);
        }
      }, 1500)
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const screen = new Screen();

  document.getElementById("start").addEventListener("click", () => {
    document.querySelector("#screen").innerHTML = "";
    
    const wordList =  getWordList();
    
    wordList.forEach((value, index) => {
      setTimeout(() => {
        if (index === wordList.length - 1) {
          const positon = screen.getCenterPostion(false, value.length);
          const word = new Word(value, false, positon.coordinate, positon.place);
          word.animationForLastWord(screen.setParts, screen);
        } else {
          const isHorizontal = Math.floor(Math.random() * 2);
          const positon = screen.getPostion(isHorizontal, value.length);
          const word = new Word(value, isHorizontal, positon.coordinate, positon.place);
          word.animation(screen.setParts, screen);
        }
      }, index * 800);
    });
  });

  const getWordList = () => {
    const wordElems = document.querySelectorAll('input[type="text"]');
    return Array.from(wordElems).filter(elem => elem.value !== "").map(elem => elem.value);
  }

  document.getElementById("reset").addEventListener("click", () => {
    const wordElems = document.querySelectorAll('input[type="text"]');
    for(let i = 0; i < wordElems.length; i ++) {
      wordElems[i].value = "";
    }
  });

  document.getElementById("add").addEventListener("click", () => {
    document.getElementById("word-list").appendChild(generateAddElem());
  });

  const generateAddElem = () => {
    const LI_ELEM = document.createElement("li");
    LI_ELEM.classList.add("list-group-item");
    const INPUT_ELEM = document.createElement("input");
    INPUT_ELEM.type = "text";
    INPUT_ELEM.classList.add("form-control");
    INPUT_ELEM.placeholder = "セリフ";
    LI_ELEM.appendChild(INPUT_ELEM);
    return LI_ELEM;
  }
});
