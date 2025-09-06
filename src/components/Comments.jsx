import { useState } from "react";
import DOMPurify from "dompurify";

import Button from "./Button";

// Stored XSS Demo
function Comments() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = (e) => {
    e.preventDefault();

    if (!newComment) return alert("Please enter a comment");
    setComments([...comments, newComment]);
    setNewComment("");
  };

  return (
    <div>
      <h2 className="mb-2 font-bold text-stone-800">
        💬 Unsafe Comments (Stored XSS Demo)
      </h2>
      {comments.map((c, i) => (
        <div key={i} className="mb-2 pl-2">
          {/* ❌ Intentionally vulnerable: executes any JS inside */}
          {/* But we want to allow HTML tags for WYSIWYG content */}
          <div
            // dangerouslySetInnerHTML={{ __html: `👱🏻‍♂️: ${DOMPurify.sanitize(c)}` }}
          />
          {/* <div dangerouslySetInnerHTML={{ __html: `👱🏻‍♂️: ${c}` }} /> */}
          <div>👱🏻‍♂️: {c}</div>
        </div>
      ))}
      <h3 className="mt-2 mb-2 font-semibold">Leave a comment for us:</h3>
      <form
        className="flex flex-col items-start gap-4"
        onSubmit={handleAddComment}
      >
        <textarea
          className="w-xl rounded-md border border-gray-300 px-3 py-2 focus:outline-yellow-500"
          rows={3}
          placeholder="Leave a comment (interpreted as HTML)."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        {/* <img src=x onerror="alert('Stolen:'+localStorage.getItem('token'))"></img> */}
        <Button type="submit">Add comment</Button>
      </form>
    </div>
  );
}

export default Comments;
