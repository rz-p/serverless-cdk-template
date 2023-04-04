const addLeadingZero = (a: number) => {
  return a < 10 ? "0" + a : a
}

export const generateFileName = (extension: string) => {
  const timeStamp = new Date()
  const year = timeStamp.getFullYear()
  const month = timeStamp.getUTCMonth() + 1
  const day = timeStamp.getDate()
  const hour = addLeadingZero(timeStamp.getHours())
  const minute = addLeadingZero(timeStamp.getMinutes())
  const second = addLeadingZero(timeStamp.getSeconds())

  return `${year}/${month}/${day}/${hour}:${minute}:${second}.${extension}`
}
