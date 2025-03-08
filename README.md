# OnlyCodez - Template Customization Platform

OnlyCodez is a web application that allows users to customize purchased design templates and generate code for use in Dubsado.

## Features

- **Secure Authentication**: Login with email/password using Supabase Auth
- **Template Access Control**: Users can only access templates they've purchased
- **Visual Template Browser**: Browse purchased templates with thumbnails
- **Interactive WYSIWYG Editor**: Edit elements directly by clicking on them in the preview
- **Real-time Preview**: See changes instantly as you customize
- **Code Generation**: Generate, copy, and download the final HTML/CSS code

## Tech Stack

- **Frontend**: React (Next.js), TailwindCSS
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Code Editing**: CodeMirror
- **Download Support**: JSZip for exporting templates

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/onlycodez.git
cd onlycodez
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using the Interactive Editor

OnlyCodez features a powerful interactive editor that lets you:

1. **Click text directly** to edit it inline
2. **Click images** to update URLs
3. **Click elements** with special color attributes to change their colors
4. **See changes instantly** without page refreshes or form submissions

## Database Schema

### Tables

1. **users** (managed by Supabase Auth)
   - id (primary key)
   - email
   - created_at

2. **templates**
   - id (primary key)
   - name
   - description
   - thumbnail (URL)
   - html_structure
   - css_structure
   - customizable_fields (JSON)

3. **user_templates**
   - id (primary key)
   - user_id (foreign key to users.id)
   - template_id (foreign key to templates.id)
   - purchased_at (timestamp)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 