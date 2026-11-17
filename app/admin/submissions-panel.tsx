"use client";
import { useCallback, useState } from "react";
import { SubmissionsSection } from "./sections";
import { useResource, Icon, Loading, ErrorState } from "./ui";
import { STUDIO_URL } from "../../lib/sanity/config";
import "./admin.css";
export default function SubmissionsPanel() {
  const me = useResource<{ email: string }>("me");
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const notify = useCallback(
    (kind: "success" | "error", message: string) =>
      setNotice({ kind, message }),
    [],
  );
  return (
    <div className="cms-workspace cms-inbox-workspace">
      <aside className="cms-sidebar">
        <a className="cms-brand" href="/admin#submissions">
          <span>Beckett House</span>
          <span className="cms-brand-caption">STAFF WORKSPACE</span>
        </a>
        <nav aria-label="Staff workspace">
          <div className="cms-nav-group">
            <a href="#submissions" className="is-active" aria-current="page">
              <Icon name="inbox" />
              <span>Submissions</span>
            </a>
            <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer">
              <Icon name="pages" />
              <span>Edit website in Sanity</span>
              <Icon name="external" size={14} />
            </a>
          </div>
        </nav>
        <div className="cms-sidebar-bottom">
          <div className="cms-account">
            <span>
              <strong>Signed in</strong>
              <small>{me.data?.email}</small>
            </span>
            <a href="/cdn-cgi/access/logout" aria-label="Sign out">
              <Icon name="logout" />
            </a>
          </div>
        </div>
      </aside>
      <div className="cms-body">
        <header className="cms-topbar">
          <span>Beckett House · Staff workspace</span>
          <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer">
            Edit website <Icon name="external" size={14} />
          </a>
          <a href="/cdn-cgi/access/logout" aria-label="Sign out">
            <Icon name="logout" size={18} />
          </a>
        </header>
        <main className="cms-main" id="cms-main">
          <div className="cms-page-heading">
            <div>
              <p className="cms-eyebrow">NURSERY ENQUIRIES</p>
              <h1>Submissions</h1>
              <p>
                Review visit requests and registrations. Website content is
                managed in Sanity.
              </p>
            </div>
          </div>
          {notice && (
            <div
              role="status"
              className={`cms-notice cms-notice-${notice.kind}`}
            >
              {notice.message}
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}
          {me.loading ? (
            <Loading />
          ) : me.error ? (
            <ErrorState message={me.error} retry={me.reload} />
          ) : (
            <SubmissionsSection notify={notify} active />
          )}
        </main>
      </div>
    </div>
  );
}
