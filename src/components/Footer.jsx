import { Leaf, Facebook, Instagram, Twitter, Youtube, CreditCard, Truck, Shield, Headphones } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const features = [
    { icon: Truck, title: 'Free Delivery', description: 'On orders above ₹299' },
    { icon: Shield, title: 'Fresh Guaranteed', description: '100% quality assurance' },
    { icon: Headphones, title: '24/7 Support', description: 'Always here to help' },
    { icon: CreditCard, title: 'Secure Payment', description: 'Multiple payment options' },
  ];

  const footerLinks = {
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    support: [
      { label: 'Contact Us', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
    quickLinks: [
      { label: 'My Account', onClick: () => onNavigate('profile') },
      { label: 'My Orders', onClick: () => onNavigate('orders') },
      { label: 'Wishlist', onClick: () => onNavigate('wishlist') },
      { label: 'Rewards', onClick: () => onNavigate('rewards') },
    ],
  };

  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="border-b border-white/10">
        <div className="section-container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 group"
              >
                <div className="w-12 h-12 bg-[#006A52]/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-[#006A52] group-hover:scale-110">
                  <feature.icon className="w-6 h-6 text-[#006A52] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#006A52] rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Thakkalies</span>
            </div>
            <p className="text-white/60 mb-6 max-w-sm">
              Fresh groceries, delivered with care. Connecting local farmers to your doorstep with transparency and trust.
            </p>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Subscribe for updates</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#006A52] transition-colors"
                />
                <button className="px-6 py-3 bg-[#006A52] text-white rounded-xl font-medium hover:bg-[#00523F] transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Youtube, label: 'YouTube' },
              ].map((social) => (
                <button
                  key={social.label}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#006A52] hover:scale-110 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © 2024 Thakkalies. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-sm">Payment Methods:</span>
              <div className="flex gap-2">
                {['Visa', 'Mastercard', 'UPI', 'COD'].map((method) => (
                  <div
                    key={method}
                    className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white/60"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
