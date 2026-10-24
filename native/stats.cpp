#include <cstdint>
#include <fstream>
#include <iostream>

/** Счётчики содержимого файла. */
struct Statistics {
    std::uint64_t lines = 0;
    std::uint64_t words = 0;
    std::uint64_t alnum = 0;
    std::uint64_t bytes = 0;
};

/** Проверяет ASCII-пробелы и переводы строк. */
bool is_space(char c) {
    return c == ' ' ||
           c == '\t' ||
           c == '\n' ||
           c == '\r' ||
           c == '\v' ||
           c == '\f';
}

/** Последовательно читает файл блоками и вычисляет статистику. */
bool count_file(const char* name, Statistics& result) {
    result = Statistics{};

    std::ifstream file(name, std::ios::binary);

    if (!file.is_open()) {
        return false;
    }

    char buffer[4096];
    char last_char = '\0';
    bool in_word = false;

    while (file) {
        file.read(buffer, sizeof(buffer));

        const std::streamsize count = file.gcount();

        for (std::streamsize i = 0; i < count; ++i) {
            const char c = buffer[i];

            ++result.bytes;
            last_char = c;

            if (c == '\n') {
                ++result.lines;
            }

            if ((c >= 'A' && c <= 'Z') ||
                (c >= 'a' && c <= 'z') ||
                (c >= '0' && c <= '9')) {
                ++result.alnum;
            }

            if (is_space(c)) {
                in_word = false;
            } else if (!in_word) {
                ++result.words;
                in_word = true;
            }
        }
    }

    if (file.bad() || (!file.eof() && file.fail())) {
        return false;
    }

    if (result.bytes > 0 && last_char != '\n') {
        ++result.lines;
    }

    return true;
}

/** Принимает путь и выводит статистику в формате JSON. */
int main(int argc, char** argv) {
    if (argc != 2) {
        std::cerr << "Expected one file path\n";
        return 1;
    }

    Statistics stats;

    if (!count_file(argv[1], stats)) {
        std::cerr << "Cannot read file\n";
        return 1;
    }

    std::cout
        << "{\"lines\":" << stats.lines
        << ",\"words\":" << stats.words
        << ",\"alnum\":" << stats.alnum
        << ",\"bytes\":" << stats.bytes
        << "}\n";

    return 0;
}