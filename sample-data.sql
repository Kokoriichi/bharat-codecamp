-- Sample data for CodeWithHarry Notes and Cheatsheets
-- Run this SQL in your Lovable Cloud backend to populate the database
-- This adds LINKS to CodeWithHarry's resources (not the actual copyrighted content)

-- Insert sample cheatsheets (update URLs with actual CodeWithHarry links)
INSERT INTO public.cheatsheets (title, description, language, url, thumbnail_url) VALUES
('Python Cheatsheet', 'Complete Python reference guide by CodeWithHarry', 'python', 'https://www.codewithharry.com/blogpost/python-cheatsheet/', NULL),
('JavaScript Cheatsheet', 'JavaScript quick reference guide', 'javascript', 'https://www.codewithharry.com/blogpost/javascript-cheatsheet/', NULL),
('C++ Cheatsheet', 'C++ programming reference guide', 'cpp', 'https://www.codewithharry.com/blogpost/cpp-cheatsheet/', NULL),
('Java Cheatsheet', 'Java programming quick reference', 'java', 'https://www.codewithharry.com/blogpost/java-cheatsheet/', NULL),
('C Cheatsheet', 'C programming language reference', 'c', 'https://www.codewithharry.com/blogpost/c-cheatsheet/', NULL),
('HTML Cheatsheet', 'HTML tags and attributes reference', 'html', 'https://www.codewithharry.com/blogpost/html-cheatsheet/', NULL),
('CSS Cheatsheet', 'CSS properties and selectors guide', 'css', 'https://www.codewithharry.com/blogpost/css-cheatsheet/', NULL),
('Git Cheatsheet', 'Git commands quick reference', 'git', 'https://www.codewithharry.com/blogpost/git-cheatsheet/', NULL),
('SQL Cheatsheet', 'SQL queries reference guide', 'sql', 'https://www.codewithharry.com/blogpost/sql-cheatsheet/', NULL),
('React Cheatsheet', 'React.js quick reference', 'javascript', 'https://www.codewithharry.com/blogpost/react-cheatsheet/', NULL);

-- Note: For the lessons table, you should add links to CodeWithHarry's YouTube videos
-- Example:
INSERT INTO public.lessons (title, description, language, difficulty, video_url, thumbnail_url, markdown_notes, cheatsheet_url) VALUES
('Python Tutorial for Beginners', 'Complete Python course in Hindi', 'python', 'beginner', 'https://www.youtube.com/watch?v=gfDE2a7MKjA', NULL, '# Python Notes\n\nFind complete notes at: https://www.codewithharry.com/notes', 'https://www.codewithharry.com/blogpost/python-cheatsheet/'),
('JavaScript Tutorial', 'Learn JavaScript from scratch', 'javascript', 'beginner', 'https://www.youtube.com/watch?v=ER9SspLe4Hg', NULL, '# JavaScript Notes\n\nFind complete notes at: https://www.codewithharry.com/notes', 'https://www.codewithharry.com/blogpost/javascript-cheatsheet/'),
('C++ Tutorial', 'C++ programming complete course', 'cpp', 'beginner', 'https://www.youtube.com/watch?v=yGB9jhsEsr8', NULL, '# C++ Notes\n\nFind complete notes at: https://www.codewithharry.com/notes', 'https://www.codewithharry.com/blogpost/cpp-cheatsheet/'),
('Java Tutorial', 'Java programming full course', 'java', 'beginner', 'https://www.youtube.com/watch?v=ntLJmHOJ0ME', NULL, '# Java Notes\n\nFind complete notes at: https://www.codewithharry.com/notes', 'https://www.codewithharry.com/blogpost/java-cheatsheet/'),
('Web Development Course', 'Complete web dev tutorial', 'html', 'beginner', 'https://www.youtube.com/watch?v=6mbwJ2xhgzM', NULL, '# Web Development Notes\n\nFind complete notes at: https://www.codewithharry.com/notes', 'https://www.codewithharry.com/blogpost/html-cheatsheet/');

-- Instructions to run this SQL:
-- 1. Go to your Lovable Cloud backend (click "View Backend" in the chat)
-- 2. Navigate to the Table Editor or SQL Editor
-- 3. Paste and run this SQL
-- 4. Update the URLs with actual CodeWithHarry resource links
-- 5. Refresh your app to see the data
