import './App.scss';
import SearchForm from './components/SearchForm';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Bookle-Talk</h1>
      </header>

      <main className="app-main">
        <SearchForm title='Bookle-Talk'/>
      </main>

      <footer className="app-footer">
        <p>북톡 - 도서 검색 서비스</p>
      </footer>
    </div>
  );
}

export default App;