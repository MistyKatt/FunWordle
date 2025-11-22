using FunWordle.Core.Interfaces.DataProvider;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;

namespace FunWordle.Core;

public sealed class FileWordListProvider : IWordListProvider
{
    public IReadOnlyList<string> WordList { get; }

    public FileWordListProvider(string filePath)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException($"Word list file not found: {filePath}");

        var loaded = File.ReadAllLines(filePath)
            .Select(w => w.Trim().ToUpperInvariant())
            .Where(w => w.Length == 5 && w.All(char.IsLetter))
            .Distinct()
            .ToList();
        WordList = new ReadOnlyCollection<string>(loaded);
    }
}

