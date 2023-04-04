import { generateFileName } from "../lambda/modules/generateFileName"

test.each([
  [new Date(2023, 1, 1, 2, 2, 2), "2023/2/1/02:02:02.txt"],
  [new Date(2023, 11, 12, 12, 12, 12), "2023/12/12/12:12:12.txt"]
])(
  "Filenames for S3 are correctly generated with leading zeros",
  (actual, expected) => {
    jest
      .spyOn(global, "Date")
      .mockImplementation(() => actual as unknown as Date)
    const fileName = generateFileName("txt")
    expect(fileName).toEqual(expected)
  }
)
