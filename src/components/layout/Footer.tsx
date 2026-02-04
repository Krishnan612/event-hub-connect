import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">CSE Events</h3>
                <p className="text-xs text-muted-foreground">Department Portal</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The central hub for all Computer Science & Engineering department events. 
              Stay updated, register, and participate in symposiums, workshops, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-display font-semibold text-foreground">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>CSE Department, Main Building</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                {/* <Mail className="h-4 w-4 text-primary" />
                <span>techforce.in</span> */}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                {/* <Phone className="h-4 w-4 text-primary" />
                <span>+91 1234 567890</span> */}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {currentYear} Computer Science & Engineering Department. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
