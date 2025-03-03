import Link from 'next/link';

const navigation = {
  services: [
    { name: 'CA Services', href: '/client/services/ca' },
    { name: 'Audit', href: '/client/services/audit' },
    { name: 'Registration', href: '/client/services/registration' },
    { name: 'Tax Services', href: '/client/services/tax' },
    { name: 'Consulting', href: '/client/services/consulting' },
  ],
  support: [
    { name: 'Contact', href: '/client/contact' },
    { name: 'FAQ', href: '/client/faq' },
    { name: 'Live Chat', href: '/client/chat' },
    { name: 'Knowledge Base', href: '/client/knowledge-base' },
  ],
  company: [
    { name: 'About Us', href: '/client/about' },
    { name: 'Blog', href: '/client/blog' },
    { name: 'Careers', href: '/client/careers' },
    { name: 'Press', href: '/client/press' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/client/privacy' },
    { name: 'Terms of Service', href: '/client/terms' },
    { name: 'Cookie Policy', href: '/client/cookies' },
  ],
};

export function ClientFooter() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/client" className="text-2xl font-bold text-white">
              SKS Consulting
            </Link>
            <p className="text-sm leading-6 text-gray-300">
              Professional consulting services for all your business needs. Expert solutions tailored to your success.
            </p>
            <div className="flex space-x-6">
              {/* Add social media links here */}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Services</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.services.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} SKS Consulting. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 