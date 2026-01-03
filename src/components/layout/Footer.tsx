import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-muted/30 py-6 md:py-0">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row px-4 max-w-7xl">
                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        &copy; {new Date().getFullYear()} Storead. All rights reserved.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link to="/terms" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground">
                        이용약관
                    </Link>
                    <Link to="/privacy" className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground">
                        개인정보처리방침
                    </Link>
                </div>
            </div>
        </footer>
    );
}
