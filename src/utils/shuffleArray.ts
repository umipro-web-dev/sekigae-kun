const shuffleArray = <T>(array: T[]) => {
    const cloneArray = [...array]

    for (let i = cloneArray.length - 1; i >= 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1))
      // 配列の要素の順番を入れ替える
      const tmpStorage = cloneArray[i]
      cloneArray[i] = cloneArray[rand]
      cloneArray[rand] = tmpStorage
    }

    return cloneArray
}
  
export default shuffleArray;