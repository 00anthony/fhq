'use client';

import Link from 'next/link';
import SectionHeader from './SectionHeader';
import Image from 'next/image';
import { LazyMotion, domAnimation, m } from 'framer-motion';

const Intro = () => {
  return (
    <section className="bg-gray-100 text-center m-auto p-2 md:p-12 h-5/6" id="about">
      <LazyMotion features={domAnimation}>
        <m.div
          className="max-w-5xl mx-auto flex flex-col-reverse lg:flex-row py-8 justify-between"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="lg:w-1/2 flex flex-col lg:mx-4 justify-center">
            <Image
              src="/images/About2.jpg"
              alt="JJ and Los"
              width={1080}
              height={1350}
              loading="lazy"
              className="w-full h-auto rounded-2xl float-right"
            />
          </div>

          <m.div
            className="flex-col my-4 text-center lg:my-0 lg:justify-end w-full lg:w-1/2 px-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          >
            <SectionHeader title="Welcome to Faded Headquarters" />

            <p className="my-3 text-xl text-black font-semibold">
              We don’t chase trends, we set standards. At Faded HQ, it’s all about precision,
              consistency, and real craftsmanship. No shortcuts, no gimmicks — just clean fades,
              sharp lines, and a barbershop experience that speaks for itself.
            </p>

            <Link
              href="#footer"
              className="text-white bg-red-900/80 backdrop-blur-sm inline-flex items-center justify-center w-full px-6 py-2 my-4 text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0 group transition-all duration-300 hover:bg-red-900"
            >
              Contact us
              <svg
                className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </m.div>
        </m.div>
      </LazyMotion>

      {/* Wave separator */}
      <div className="hidden lg:block relative w-full leading-none -mb-28 rotate-180">
        <svg className="w-full h-24 md:h-32" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#f9fafb"
            d="M0,160L48,165.3C96,171,192,181,288,192C384,203,480,213,576,197.3C672,181,768,139,864,133.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default Intro;
