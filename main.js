// 設定遊戲的狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}



// 各花色的圖片
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]



// 渲染卡片
const view = {
  // 特殊數字轉換
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },


  // 產生每一張卡片的內容
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src=${symbol}>
      <p>${number}</p>
    </div>`

  },


  getCardElement(index) {
    return `<div data-index="${index}"class="card back">
    </div>`
  },

  // 選出要的節點並抽換內容
  //指些受由controller提供的洗牌function，indexs算是打亂後的陣列
  displayCards(indexs) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexs.map(index => this.getCardElement(index)).join('')
    // rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join('')
  },


  flipCards(...cards) {
    // 如果是背面要回傳正面
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return

      }

      //如果是背面救回傳正面
      card.classList.add('back')
      // innerhtml要清空
      card.innerHTML = null

    })

  },

  // pairCard(card) {
  //   card.classList.add('paired')
  // }
  pairCard(...cards) {
    cards.map(card => {
      console.log('fefewfe')
      card.classList.add('paired')
    })
  },


  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`

  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },


  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
      // 加上once  ture代表觸發一次就消失，會對瀏覽器的效能影響較少
    })
  },


  //  遊戲成功結束的畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `   
      <p>Congrats!</p>
      <p>Score: ${modal.score}</p>
      <p>You've tried: ${modal.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },


  // 新增一個倒數計時的函數
  countdown(totalSecond) {
    const countDown = document.querySelector('.countDown')
    const min = Math.floor(totalSecond / 60)
    const sec = Math.floor(totalSecond % 60)
    countDown.innerHTML = `Time: ${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`
    // countDown.innerHTML = `Time: 00:${totalSecond}`


    const timeCountDown = setInterval(() => {
      // 每經過一秒都會減少一秒
      totalSecond--;
      // countDown.innerHTML = `Time: 00:${totalSecond}`
      modal.displayTime(totalSecond);
      if (totalSecond <= 0 || totalSecond < 1) {
        // 如果小於零結束這個setinterval
        clearInterval(timeCountDown)
      }
    }, 1000)
  },

  // 時間到失敗的畫面
  showGameFailed() {
    const div = document.createElement('div')
    div.classList.add('failed')
    div.innerHTML = `   
      <p>Sorry! You failed</p>
      <p>Please try again</p>
      <div class="retrydiv">
        <button type="button" class="btn btn-secondary retry" ">Retry</button>
      </div>
    `
    const header = document.querySelector('#header')
    header.before(div)


    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', event => {
        alert('無效')
      })

    })


    const retry = document.querySelector('.retry')
    retry.addEventListener('click', e => {
      // 頁面重新整理
      window.location.reload();

    })
  },



}

// 洗牌演算法
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number

  }
}



// 宣告controller來做一個遊戲的狀態的分配
// 所有程式應該都是由controller呼叫
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    //由 controller 來呼叫 utility.getRandomNumberArray，避免 view 和 utility 產生接觸
    view.displayCards(utility.getRandomNumberArray(52))
    //增加倒數計時器的畫面
    view.countdown(300)
  },


  // 翻牌的時候會出呼叫controller，讓遊戲繼續進行，依照不同的遊戲狀態有不同行為
  dispatchCardAction(card) {
    // 翻到正面就跳出
    if (!card.classList.contains('back')) {
      return
    }


    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        //  要改狀態
        this.currentState = GAME_STATE.SecondCardAwaits
        // 翻過來
        view.flipCards(card)
        // 放到存放數字的群組
        modal.revealedCards.push(card)
        break

      case GAME_STATE.SecondCardAwaits:
        // console.log(modal)
        // view.renderTriedTimes(++modal.triedTimes)  // add this 
        // view.flipCards(card)
        // modal.revealedCards.push(card)
        // // 判斷配對是否成功
        // if (modal.isRevealCardsMatched()) {
        //   // 配對成功
        //   view.renderScore(modal.score += 10)    // add this 
        //   this.currentState = GAME_STATE.CardsMatched
        //   view.pairCards(...modal.revealedCards)
        //   modal.revealedCards = []
        //   this.currentState = GAME_STATE.FirstCardAwaits
        // } else {
        //   // 配對失敗
        //   this.currentState = GAME_STATE.CardsMatchFailed
        //   setTimeout(this.resetCards, 1000)
        // }
        console.log(modal)
        view.renderTriedTimes(++modal.triedTimes)
        view.flipCards(card)
        modal.revealedCards.push(card)
        // 判斷配對是否成功
        if (modal.isRevealCardsMatched()) {
          // 配對正確
          view.renderScore(modal.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(modal.revealedCards[0])
          view.pairCard(modal.revealedCards[1])
          modal.revealedCards = []
          if (modal.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          // 回到原始狀態
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          //settimeout要傳function本身，而不是結果，所以不能寫成resetcards()
          // 這邊的this就是resetcards這個function，而不是controller
          // 我們期待 this 要指向 controller，然而當我們把 resetCards 當成參數傳給 setTimeout 時，this 的對象變成了 setTimeout，而 setTimeout 又是一個由瀏覽器提供的東西，而不是我們自己定義在 controller 的函式。
          view.appendWrongAnimation(...modal.revealedCards)
          setTimeout(this.resetCards, 1000)
        }

        break

    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', modal.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    // view.flipCard(modal.revealedCards[0])
    // view.flipCard(modal.revealedCards[1])
    view.flipCards(...modal.revealedCards)
    modal.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits

  }
}

controller.generateCards()

const modal = {
  // 代表翻開的卡片
  revealedCards: [],
  isRevealCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,

  displayTime(second) {
    const countDown = document.querySelector('.countDown')
    const min = Math.floor(second / 60)
    const sec = Math.floor(second % 60)
    // 運用三元運算子維持三位數
    countDown.innerHTML = `Time: ${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`
    if (min == 0 && sec == 0) {
      view.showGameFailed()
    }
  }

}



// 呼叫物件
// view.displayCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // 呼叫翻牌的函式
    // view.flipCard(card)
    // view.appendWrongAnimation(card)
    controller.dispatchCardAction(card)
  })

})





//第二種寫法，其中當屬性和函數名稱一樣可以省略不寫，成為displayCards:function displayCards(){}
// const view = {
//   displayCards:function displayCards() {
//     document.querySelector('#cards').innerHTML = `
//       <div class="card">
//         <p>6</p>
//         <img src="https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png">
//         <p>6</p>
//       </div>
// `
//   }
// }
// view.displayCards()