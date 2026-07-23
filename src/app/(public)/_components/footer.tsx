


export function Footer() { 

    return (
        <footer className="bg-gray-100 text-gray-500 py-6 text-center text-sm md:text-base">
            <p>
             Todos os direitos reservados - {new Date().getFullYear()} - <span className="hover:text-black
            duration-300">@odontoPro</span>
            </p>
        </footer>
    )
}