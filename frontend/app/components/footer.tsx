export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-white/5 py-8 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Main content */}
          <div className="text-center">
            <p className="text-sm text-white/70">
              Built with <span className="text-red-400">♥</span> by{" "}
              <a
                href="https://avenster.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white transition-colors hover:text-white/80"
              >
                Avenster
              </a>{" "}
              aka Ankur Kaushal
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://portfolio-group.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Portfolio
            </a>

            <a
              href="https://github.com/avenster"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              GitHub
            </a>
          </div>

          {/* Copyright */}
          <p className="pt-2 text-xs text-white/30">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}