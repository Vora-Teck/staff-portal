/**
 * Mobile hamburger menu
 */
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger')
    const mobileMenu = document.getElementById('mobileMenu')
    let isOpen = false
    
    hamburger.addEventListener('click', () => {
        isOpen = !isOpen
        
        if (isOpen) {
            // Animate lines to X
            document.getElementById('line1').style.transform = 'rotate(45deg) translate(5px, 5px)'
            document.getElementById('line2').style.opacity = '0'
            document.getElementById('line3').style.transform = 'rotate(-45deg) translate(5px, -5px)'
            mobileMenu.classList.remove('hidden')
            mobileMenu.style.display = 'block'
        } else {
            // Reset to hamburger
            document.getElementById('line1').style.transform = ''
            document.getElementById('line2').style.opacity = '1'
            document.getElementById('line3').style.transform = ''
            mobileMenu.style.display = 'none'
        }
    })
}

function hideMobileMenu() {
    const hamburger = document.getElementById('hamburger')
    const mobileMenu = document.getElementById('mobileMenu')
    
    // Reset hamburger
    document.getElementById('line1').style.transform = ''
    document.getElementById('line2').style.opacity = '1'
    document.getElementById('line3').style.transform = ''
    mobileMenu.style.display = 'none'
}

function initializeTailwind() {
  return {
      config(userConfig = {}) {
          return {
              content: [],
              theme: {
                  extend: {},
              },
              ...userConfig,
          }
      },
      theme: {
          extend: {},
      },
  }
}

/**
 * Main initialization when page loads
 */
$(document).ready(async function () {
    showLoader()
    // Tailwind
    initializeTailwind()
    
    // Mobile menu
    setupMobileMenu()
    
    await showSchoolInfo()
    
    hideLoader()
    
    // Add entrance animations to all cards on landing page
    function animateCards() {
        const cards = document.querySelectorAll('.card-hover')
        cards.forEach((card, index) => {
            card.style.opacity = '0'
            card.style.transform = 'translateY(30px)'
            setTimeout(() => {
                card.style.transition = `all 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms`
                card.style.opacity = '1'
                card.style.transform = 'translateY(0)'
            }, 300)
        })
    }
    
    // Run card animations once landing page is visible
    if (document.getElementById('landing-page').offsetParent !== null) {
        setTimeout(animateCards, 800)
    }
})


