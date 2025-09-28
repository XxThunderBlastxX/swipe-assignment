# Testing Guide for AI Interview Application

## Quick Test Scenarios

### 1. Resume Upload Test (DOCX Only)

Currently, PDF support is not available due to browser compatibility issues. You can test with DOCX files or manually enter information. Here's how to create a test resume:

**Sample Resume Content (save as .docx):**
```
John Smith
Software Engineer

Email: john.smith@email.com
Phone: (555) 123-4567

EXPERIENCE
Full Stack Developer at Tech Corp
- Developed React applications
- Built Node.js APIs
- Worked with databases

EDUCATION
Computer Science Degree
University of Technology

SKILLS
React, Node.js, JavaScript, TypeScript, MongoDB
```

### 2. Manual Data Entry Test

If you don't have a DOCX file, you can test by:
1. Going to the Interviewee tab
2. Try uploading a PDF (you'll get a helpful error message with alternatives)
3. Click "Start New Interview" (if welcome back modal appears)
4. The app will show missing fields form where you can manually enter:
   - Name: John Doe
   - Email: john.doe@test.com
   - Phone: 5551234567

### 3. Interview Flow Test

**Expected Flow:**
1. Upload resume or enter manual data
2. See interview instructions screen
3. Click "Start Interview"
4. Answer 6 questions with these time limits:
   - Questions 1-2: Easy (20 seconds each)
   - Questions 3-4: Medium (60 seconds each)
   - Questions 5-6: Hard (120 seconds each)

**Sample Answers to Try:**
- Easy Q: "JavaScript variables can be declared using var, let, or const..."
- Medium Q: "React hooks like useState and useEffect allow functional components..."
- Hard Q: "To implement a custom hook, I would create a function that starts with 'use'..."

### 4. Timer Testing

**Test Scenarios:**
- Submit answer early (click Submit Answer)
- Let timer run out (answer auto-submits)
- Refresh page mid-interview (should show Welcome Back modal)

### 5. Dashboard Testing

**Switch to Interviewer Tab to test:**
- View all candidates in the list
- Search for candidates by name/email
- Sort by Name, Score, Date
- Filter by status (All, Completed, In Progress, Not Started)
- Click "View Details" on completed interview

### 6. Persistence Testing

**Test Data Persistence:**
1. Start an interview
2. Answer 2-3 questions
3. Refresh the browser
4. Should see "Welcome Back" modal
5. Click "Continue Interview" - should resume where left off

### 7. Scoring System Verification

**Expected Scoring:**
- Easy questions: 10 points each (max 20 total)
- Medium questions: 20 points each (max 40 total)  
- Hard questions: 30 points each (max 60 total)
- Maximum possible: 120 points
- Timeout penalty: 50% reduction
- Quality multiplier: Based on answer length

### 8. Edge Cases to Test

**Empty Submissions:**
- Try submitting empty answers
- Let timer run out with no text

**Long Answers:**
- Test with very long answers (500+ characters)
- Test with very short answers (1-2 words)

**Multiple Sessions:**
- Complete one full interview
- Start a second interview with different candidate info
- Check that both appear in interviewer dashboard

**Browser Compatibility:**
- Test in Chrome, Firefox, Safari, Edge
- Test on mobile devices (responsive design)

## Expected Results

### Successful Interview Completion:
- Final score displayed (0-120 range)
- AI summary showing performance breakdown
- All Q&A pairs visible in candidate detail view
- Statistics showing completion rate and timeouts

### Data Persistence:
- All data survives page refreshes
- Multiple candidates stored separately
- Search and filter functions work correctly
- Sorting maintains state

## Common Issues & Solutions

### Resume Upload Issues:
- **Problem**: "PDF processing is currently not supported" 
- **Solution**: Convert PDF to DOCX using online tools like SmallPDF or PDF24, or enter information manually

- **Problem**: "Unsupported file format" 
- **Solution**: Only DOCX files are fully supported currently

### Timer Issues:
- **Problem**: Timer doesn't start
- **Solution**: Make sure to click "Start Interview" first

### Missing Data:
- **Problem**: Candidate info not found
- **Solution**: Clear localStorage if testing multiple times:
  ```javascript
  localStorage.removeItem('interview-storage')
  ```

### Performance Issues:
- **Problem**: App feels slow
- **Solution**: Check browser dev tools for errors, ensure good internet connection

## Test Data Cleanup

To reset all test data:
1. Open browser dev tools (F12)
2. Go to Application/Storage tab
3. Clear localStorage for localhost:3000
4. Refresh the page

Or run in console:
```javascript
localStorage.clear()
location.reload()
```

## Automated Testing Checklist

- [ ] Resume upload with valid DOCX
- [ ] PDF upload (should show helpful error message)
- [ ] Manual data entry form
- [ ] Interview question flow (all 6 questions)
- [ ] Timer functionality (count down, auto-submit)
- [ ] Early submission
- [ ] Session persistence (refresh test)
- [ ] Interviewer dashboard view
- [ ] Candidate detail view
- [ ] Search functionality
- [ ] Sort functionality
- [ ] Filter functionality
- [ ] Multiple candidate sessions
- [ ] Scoring calculation
- [ ] Welcome back modal
- [ ] PDF conversion guidance
- [ ] Responsive design on mobile