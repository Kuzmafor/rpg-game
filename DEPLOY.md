# Инструкция по развертыванию на Vercel

## Вариант 1: Через GitHub (Рекомендуется)

1. Создайте репозиторий на GitHub:
   - Перейдите на https://github.com/new
   - Создайте новый репозиторий (можно приватный)

2. Загрузите код в GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ваш-username/название-репозитория.git
   git push -u origin main
   ```

3. Разверните на Vercel:
   - Перейдите на https://vercel.com
   - Нажмите "Sign Up" и войдите через GitHub
   - Нажмите "Add New Project"
   - Выберите ваш репозиторий
   - Нажмите "Deploy"
   - Готово! Vercel автоматически соберет и развернет проект

## Вариант 2: Через Vercel CLI (Быстрый способ)

1. Установите Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Войдите в Vercel:
   ```bash
   vercel login
   ```

3. Разверните проект:
   ```bash
   vercel
   ```
   - Следуйте инструкциям в терминале
   - Vercel автоматически определит настройки проекта
   - После завершения вы получите ссылку на ваш сайт

4. Для продакшн-деплоя:
   ```bash
   vercel --prod
   ```

## Вариант 3: Netlify (Альтернатива)

1. Перейдите на https://www.netlify.com
2. Нажмите "Sign Up" и войдите через GitHub
3. Нажмите "Add new site" → "Import an existing project"
4. Выберите ваш репозиторий на GitHub
5. Настройки сборки:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Нажмите "Deploy site"

## Автоматические обновления

После первого деплоя через GitHub:
- Каждый push в main ветку автоматически обновит сайт
- Vercel/Netlify покажут статус сборки
- Вы получите уникальный URL для каждого деплоя

## Полезные ссылки

- Vercel: https://vercel.com
- Netlify: https://www.netlify.com
- GitHub: https://github.com

## Примечание

Оба сервиса предоставляют:
- ✅ Бесплатный хостинг
- ✅ HTTPS сертификат
- ✅ Автоматические обновления
- ✅ CDN для быстрой загрузки
- ✅ Неограниченное количество деплоев
