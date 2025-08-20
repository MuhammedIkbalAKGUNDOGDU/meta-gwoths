const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-16 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-slate-300 bg-clip-text text-transparent mb-4">
              MetaGrowths
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Dijital medya ajansı olarak Meta reklamları, içerik yönetimi ve
              e-ticaret çözümleriyle yanınızdayız.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Ana Hizmetler
            </h4>
            <ul className="space-y-3 text-slate-300">
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Meta Yönetimi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  İçerik Yönetimi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  E-Ticaret Yönetimi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Reklam Yönetimi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Yan Hizmetler
            </h4>
            <ul className="space-y-3 text-slate-300">
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Web Geliştirme
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Mobil Uygulama
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  SEO Optimizasyonu
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Grafik Tasarım
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">İletişim</h4>
            <ul className="space-y-3 text-slate-300">
              <li className="hover:text-blue-400 transition-colors duration-300">
                info@metagrowths.com
              </li>
              <li className="hover:text-blue-400 transition-colors duration-300">
                +90 555 123 4567
              </li>
              <li className="hover:text-blue-400 transition-colors duration-300">
                İstanbul, Türkiye
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
          <p>&copy; 2024 MetaGrowths. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
