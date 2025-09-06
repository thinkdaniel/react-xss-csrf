// DOM-based XSS Demo
// try with http://localhost:5173/#insurance
// try with http://localhost:5173/#<img src=x onerror="alert('Gotcha 😈')">
// try with http://localhost:5173/#<img src=x onerror="alert('Stolen:'+localStorage.getItem('token'))">
function ReadDOMElement() {
  // Selecting the hash part of the URL
  const raw = window.location.hash.slice(1);
  const decoded = decodeURIComponent(raw);
  return <div dangerouslySetInnerHTML={{ __html: decoded }} />;
  // return <div>{decoded}</div>;
}

export default ReadDOMElement;
