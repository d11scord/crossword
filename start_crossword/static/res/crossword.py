import random, re, time, string
from copy import copy as duplicate

# optional, speeds up by a factor of 4
# import psyco
#
# psyco.full()


class Crossword(object):
    def __init__(self, cols, rows, empty='-', maxloops=2000, available_words=[]):
        self.cols = cols
        self.rows = rows
        self.empty = empty
        self.maxloops = maxloops
        self.available_words = available_words
        self.randomize_word_list()
        self.current_word_list = []
        self.debug = 0
        self.clear_grid()

    def clear_grid(self):  # создание сетки и заполнение её пустыми элементами
        self.grid = []
        for i in range(self.rows):
            ea_row = []
            for j in range(self.cols):
                ea_row.append(self.empty)
            self.grid.append(ea_row)

    def randomize_word_list(self):  # добавляет слова и сортирует
        temp_list = []
        for word in self.available_words:
            if isinstance(word, Word): 
                temp_list.append(Word(word.word, word.clue))
            else:
                temp_list.append(Word(word[0], word[1])) 
        random.shuffle(temp_list)  # рандомный список слов, перемешать
        temp_list.sort(key=lambda i: len(i.word), reverse=True)  # сортирует по длине
        self.available_words = temp_list

    def compute_crossword(self, time_permitted=1.00, spins=2): # генерация кроссворда
        time_permitted = float(time_permitted)

        count = 0
        copy = Crossword(self.cols, self.rows, self.empty, self.maxloops, self.available_words)

        start_full = float(time.time())
        while (float(time.time()) - start_full) < time_permitted or count == 0:  # работает только в течение x секунд
            self.debug += 1
            copy.current_word_list = []
            copy.clear_grid() #генерация сетки
            copy.randomize_word_list() #составление и сортировка списка copy.available_words
            x = 0
            while x < spins:  #  2 проходов  достаточно
                for word in copy.available_words:
                    if word not in copy.current_word_list:
                        copy.fit_and_add(word)
                x += 1
           
            if len(copy.current_word_list) > len(self.current_word_list):
                self.current_word_list = copy.current_word_list
                self.grid = copy.grid
            count += 1
        return

    def suggest_coord(self, word):
        count = 0
        coordlist = []
        glc = -1
        for given_letter in word.word:  # перебирает буквы в слове
            glc += 1
            rowc = 0
            for row in self.grid:  # перебирает строки
                rowc += 1
                colc = 0
                for cell in row:  # перебирает буквы в строках
                    colc += 1
                    if given_letter == cell:  # проверяет совпадение буквы в слове и буков в строке
                        try:  # предлагает вертикальное расположение
                            if rowc - glc > 0:  # убедимся, что начальная точка не за пределами сетки сетки
                                if ((rowc - glc) + word.length) <= self.rows:  #убедимся, что слово не выходит за сетку
                                    coordlist.append([colc, rowc - glc, 1, colc + (rowc - glc), 0])
                        except:
                            pass
                        try:  # предлагает горизонтальное расположение
                            if colc - glc > 0:  # убедимся, что начальная точка не за пределами сетки сетки
                                if ((colc - glc) + word.length) <= self.cols:  # убедимся, что слово не выходит за сетку
                                    coordlist.append([colc - glc, rowc, 0, rowc + (colc - glc), 0])
                        except:
                            pass
        
        new_coordlist = self.sort_coordlist(coordlist, word)
      
        return new_coordlist

    def sort_coordlist(self, coordlist, word):  # даёт каждой координате отметку, затем сортирует
        new_coordlist = []
        for coord in coordlist:
            col, row, vertical = coord[0], coord[1], coord[2]
            coord[4] = self.check_fit_score(col, row, vertical, word)  # проверка пересечений
            if coord[4]:  # 0 отметок отфильтрованы
                new_coordlist.append(coord)
        random.shuffle(new_coordlist)  # перемешаем список координат
        new_coordlist.sort(key=lambda i: i[4], reverse=True)  # поставим лучшие пересечения первыми
        return new_coordlist

    def fit_and_add(self,
                    word):  # подходит только для первого слова; иначе просто добавляет, если количество пересеений хорошее
        fit = False
        count = 0
        coordlist = self.suggest_coord(word)

        while not fit and count < self.maxloops:

            if len(self.current_word_list) == 0:  # это первое слово: корень
                # верхний левый корень самого длинного слова даёт лучший результат (может быть изменено)
                vertical, col, row = random.randrange(0, 2), 1, 1

              

                if self.check_fit_score(col, row, vertical, word): # проверка пересечений
                    fit = True
                    self.set_word(col, row, vertical, word, force=True)# добавление слова в список
            else:  # последующие слова рассчитываются
                try:
                    col, row, vertical = coordlist[count][0], coordlist[count][1], coordlist[count][2]
                except IndexError:
                    return  # больше нет координат, прекратить искать соответствия

                if coordlist[count][4]:  # уже отфильтрованы, но двойная проверка
                    fit = True
                    self.set_word(col, row, vertical, word, force=True)

            count += 1
        return

    def check_fit_score(self, col, row, vertical, word):
        '''
        возвращает количество пересечений (0 означает не подходит). 1 - подходит, 2+ - крест.

        Чем больше пересечений, тем лучше
        '''
        if col < 1 or row < 1:
            return 0

        count, score = 1, 1  # дадим отметке стандартное значение 1, будет изменено на 0, если обнаружатся столкновения
        for letter in word.word:
            try:
                active_cell = self.get_cell(col, row)
            except IndexError:
                return 0

            if active_cell == self.empty or active_cell == letter:
                pass
            else:
                return 0

            if active_cell == letter:
                score += 1

            if vertical:
                # проверка окружающих
                if active_cell != letter:  # не проверять окружение, если это точка пересечения
                    if not self.check_if_cell_clear(col + 1, row):  # проверить правую клетку
                        return 0

                    if not self.check_if_cell_clear(col - 1, row):  # проверить леую клетку
                        return 0

                if count == 1:  # проверить верхнюю клетку только над первой буквой
                    if not self.check_if_cell_clear(col, row - 1):
                        return 0

                if count == len(word.word):  # проверить нижнюю клетку только под последней буквой
                    if not self.check_if_cell_clear(col, row + 1):
                        return 0
            else:  # иначе горизонталь
                # проверка окружающих
                if active_cell != letter:  # не проверять окружение, если это точка пересечения
                    if not self.check_if_cell_clear(col, row - 1):  # проверить верхнюю клетку
                        return 0

                    if not self.check_if_cell_clear(col, row + 1):  # проверить нижнюю клетку
                        return 0

                if count == 1:  # проверить левую клетку только для первой буквы
                    if not self.check_if_cell_clear(col - 1, row):
                        return 0

                if count == len(word.word):  # проверить правую клетку только для последней буквы
                    if not self.check_if_cell_clear(col + 1, row):
                        return 0

            if vertical:  # перейти к следующей букве и позиции
                row += 1
            else:  # иначе горизонталь
                col += 1

            count += 1

        return score

    def set_word(self, col, row, vertical, word, force=False):  # Добавляет слово в список
        if force:
            word.col = col
            word.row = row
            word.vertical = vertical
            self.current_word_list.append(word)

            for letter in word.word:
                self.set_cell(col, row, letter)
                if vertical:
                    row += 1
                else:
                    col += 1
        return

    def set_cell(self, col, row, value):
        self.grid[row - 1][col - 1] = value

    def get_cell(self, col, row):
        return self.grid[row - 1][col - 1]

    def check_if_cell_clear(self, col, row):
        try:
            cell = self.get_cell(col, row)
            if cell == self.empty:
                return True
        except IndexError:
            pass
        return False


    def legend(self):   
        result = []
        for word in self.current_word_list:
            result.append({
                'clue': word.clue,
                'answer':  word.word,
                'position': '',
                'orientation': word.down_across(),
                'startx': word.col,
                'starty': word.row
            })
        return result


class Word(object):
    def __init__(self, word=None, clue=None):
        self.word = re.sub(r'\s', '', word.lower())
        self.clue = clue
        self.length = len(self.word)
        # the below are set when placed on board
        self.row = None
        self.col = None
        self.vertical = None
        self.number = None

    def down_across(self):  # return down or across
        if self.vertical:
            return 'down'
        else:
            return 'across'

    def __repr__(self):
        return self.word


def generate_crossword(word_list):
    a = Crossword(8, 8, '-', 5000, word_list)
    a.compute_crossword(2)
    return a.legend()
