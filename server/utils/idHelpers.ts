const nomisIdRegex = /^[A-Za-z][0-9]{4}[A-Za-z]{2}$/
const ndeliusIdRegex = /^[A-Za-z][0-9]{6}$/

export const isNomisId = (id: string) => nomisIdRegex.test(id.trim())
export const isNdeliusId = (id: string) => ndeliusIdRegex.test(id.trim())
