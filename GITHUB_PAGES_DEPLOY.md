# Развертывание на GitHub Pages

## Быстрый старт

### 1. Создайте репозиторий на GitHub
- Перейдите на https://github.com/new
- Назовите репозиторий `rpg-game` (или любое другое имя)
- Можно сделать публичным или приватным

### 2. Загрузите код в GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/rpg-game.git
git push -u origin main
```

### 3. Включите GitHub Pages
- Перейдите в Settings вашего репозитория
- Найдите раздел "Pages" в левом меню
- В разделе "Source" выберите ветку `gh-pages`
- Нажмите "Save"

### 4. Деплой проекта

**Важно:** Перед первым деплоем отредактируйте `package.json`:
- Замените `ВАШ_USERNAME` на ваш GitHub username в скрипте `deploy`

Затем выполните:

```bash
npm run deploy
```

Готово! Ваш сайт будет доступен по адресу:
`https://ВАШ_USERNAME.github.io/rpg-game/`

## Обновление сайта

Каждый раз когда хотите обновить сайт:

```bash
npm run deploy
```

## Альтернативный метод: GitHub Actions (автоматический деплой)

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

С этим методом каждый push в main автоматически обновит сайт!

## Проверка базового пути

Убедитесь, что в `vite.config.js` указан правильный базовый путь:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/rpg-game/', // Должно совпадать с названием репозитория
})
```

Если ваш репозиторий называется по-другому, измените это значение.

## Устранение проблем

### Сайт не загружается
- Проверьте, что GitHub Pages включен в настройках репозитория
- Убедитесь, что выбрана ветка `gh-pages`
- Подождите 1-2 минуты после деплоя

### Ошибка 404
- Проверьте, что `base` в `vite.config.js` совпадает с названием репозитория
- Убедитесь, что используете правильный URL

### Стили не загружаются
- Это обычно проблема с базовым путем
- Проверьте консоль браузера на ошибки 404
