#!/usr/bin/env python3
"""Local dev server for Betterson.

Plain `python3 -m http.server` lets the browser cache CSS and JS, so an edit
often doesn't show up until a hard refresh — which reads as "my change did
nothing." This serves the same files with caching turned off.

    python3 scripts/serve.py          # http://localhost:8000
    python3 scripts/serve.py 3000     # another port

Dev only. Vercel serves the production site and handles its own caching.
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"Betterson running at http://localhost:{port}  (Ctrl-C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
