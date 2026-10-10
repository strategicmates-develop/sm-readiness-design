import PropTypes from 'prop-types';

// Inline error shown under a single field.
export function FieldError({ message }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

FieldError.propTypes = { message: PropTypes.string };

// Banner shown above the navigation buttons: one headline plus optional detail lines
// (for instance the messages returned by the server on a 422).
export function ErrorBanner({ title, details = [] }) {
  if (!title) return null;
  return (
    <div role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
      <p className="font-semibold">{title}</p>
      {details.length > 0 && (
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

ErrorBanner.propTypes = {
  title: PropTypes.string,
  details: PropTypes.arrayOf(PropTypes.string),
};
