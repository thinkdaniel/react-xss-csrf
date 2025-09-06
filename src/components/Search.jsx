// Reflected XSS Demo
// try with http://localhost:5173/?q=<img src=x onerror="alert('Gotcha 😈')">
// try with http://localhost:5173/?q=<img src=x onerror="alert('Stolen:'+localStorage.getItem('token'))">
function Search() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  if (!query) return null;

  return (
    <div
      className="mx-auto max-w-sm"
      dangerouslySetInnerHTML={{
        __html: `You searched for <strong>${query}</strong>.`,
      }}
    />

    // <div>You searched for <strong>{query}</strong>.</div>
  );
}
export default Search;
