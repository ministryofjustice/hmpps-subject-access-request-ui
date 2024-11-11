// prevent double click on links
document.addEventListener('DOMContentLoaded', function () {
  const noDoubleClickLinks = document.querySelectorAll('.noDoubleClick')
  noDoubleClickLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      if (link.classList.contains('clicked')) {
        e.preventDefault()
        return
      }
      link.classList.add('clicked')
      setTimeout(() => {
        link.classList.remove('clicked')
      }, 500)
    })
  })
})
