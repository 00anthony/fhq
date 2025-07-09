const Footer = () => {
    return (
        <>
            <footer className="bg-black text-white px-4 sm:px-6 pt-10" id='footer'>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Contact Info */}
                    <div className='flex flex-col items-center text-center'>
                        <h2 className="text-xl mb-4">Contact Us</h2>
                        <p><strong>Address:</strong> 123 Main St, Your City, ST 12345</p>
                        <p><strong>Phone:</strong> <a href="tel:1234567890" className="text-blue-400 hover:underline">(123) 456-7890</a></p>
                        <p><strong>Email:</strong> <a href="mailto:contact@yourbusiness.com" className="text-blue-400 hover:underline">contact@yourbusiness.com</a></p>
                        <p><strong>Hours:</strong> Mon–Fri: 9am–5pm</p>
                    </div>

                    {/* Google Map Embed */}
                    <div className='flex flex-col items-center text-center'>
                        <h2 className="text-xl mb-4">Our Location</h2>
                        <div className="w-full max-w-[440px] aspect-[16/9] rounded-lg shadow-md overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11613.137525938486!2d-97.8096694883734!3d30.07681356490364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b537568a56449%3A0xd855484c493dcb99!2sSunfield%20Sunbright%20Activity%20Center!5e0!3m2!1sen!2sus!4v1749763348160!5m2!1sen!2sus"
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Map"
                            />
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="flex flex-col items-center text-center">
                        <h2 className="text-xl mb-4">Follow Us</h2>
                        <nav aria-label="Social media">
                            <ul className="flex space-x-4">
                                <li>
                                    <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Twitter"
                                    className="inline-flex justify-center items-center text-white hover:text-gray-500 text-xl transform hover:scale-110 transition-transform duration-200"
                                    >
                                        <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M24 11.5c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.3.6-2.1.8-.6-.6-1.5-1-2.4-1-1.7 0-3.2 1.5-3.2 3.3 0 .3 0 .5.1.7-2.7-.1-5.2-1.4-6.8-3.4-.3.5-.4 1-.4 1.7 0 1.1.6 2.1 1.5 2.7-.5 0-1-.2-1.5-.4 0 1.6 1.1 2.9 2.6 3.2-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3.1 2.3-1.1.9-2.5 1.4-4.1 1.4H8c1.5.9 3.2 1.5 5 1.5 6 0 9.3-5 9.3-9.3v-.4c.7-.5 1.3-1.1 1.7-1.8z" />
                                        </svg>
                                    </a>
                                </li>
                            <li>
                                <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="inline-flex justify-center items-center text-white hover:text-gray-500 text-xl transform hover:scale-110 transition-transform duration-200"
                                >
                                    <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.023 24L14 17h-3v-3h3v-2c0-2.7 1.672-4 4.08-4 1.153 0 2.144.086 2.433.124v2.821h-1.67c-1.31 0-1.563.623-1.563 1.536V14H21l-1 3h-2.72v7h-3.257z" />
                                    </svg>
                                </a>
                            </li>
                            </ul>
                        </nav>
                    </div>


                </div>
                {/*Subfooter */}
                <div className="bg-black mt-10 border-t border-gray-700 py-2 text-sm text-gray-500 text-center">
                    &copy; 2025 Faded Headquarters All rights reserved.
                </div>
            </footer>
        </>
    )
}
export default Footer;
